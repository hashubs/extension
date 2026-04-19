import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  createSalt,
  deriveEncryptionKeyFromPRF,
  getRandomUint8Array,
  utf8ToUint8Array,
} from '@/modules/crypto';
import { accountPublicRPCPort } from '@/shared/channel';

// ---------------------------------------------------------------------------
// Platform detection
// ---------------------------------------------------------------------------

type Platform = 'macos' | 'windows' | 'linux' | 'android' | 'ios' | 'unknown';

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  // Check order matters: iOS must come before macOS (iPad UA contains "Mac")
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  if (/Macintosh|MacIntel|MacPPC|Mac68K/i.test(ua)) return 'macos';
  if (/Win32|Win64|Windows|WinCE/i.test(ua)) return 'windows';
  if (/Linux/i.test(ua)) return 'linux';
  return 'unknown';
}

/**
 * Human-readable label for the platform authenticator.
 * Shown in buttons/UI — e.g. "Unlock with Touch ID" vs "Unlock with Windows Hello".
 */
export function getPasskeyTitle(): string {
  switch (detectPlatform()) {
    case 'macos':
      return 'Touch ID';
    case 'ios':
      return 'Face ID / Touch ID';
    case 'windows':
      return 'Windows Hello';
    case 'android':
      return 'Biometric Unlock';
    case 'linux':
    default:
      return 'Passkey Unlock';
  }
}

// ---------------------------------------------------------------------------
// PRF support detection
// ---------------------------------------------------------------------------

interface PRFExtensionResult {
  prf?: {
    enabled?: boolean;
    results?: {
      first?: ArrayBuffer;
    };
  };
}

/**
 * Checks whether the browser + platform authenticator combination can
 * actually complete a PRF-backed passkey flow.
 *
 * Strategy:
 *  1. Bail early if WebAuthn API is absent.
 *  2. Check platform authenticator availability (covers Windows Hello, Touch ID,
 *     Android biometrics, and most Linux setups with a TPM/PIN fallback).
 *  3. On Linux we do an extra capability probe via getClientCapabilities()
 *     (Chrome 133+) because many Linux setups have UVPAA = true but no PRF.
 */
export async function checkPRFSupport(): Promise<boolean> {
  if (process.env.NODE_ENV === 'development') return true;

  try {
    if (!window.PublicKeyCredential) return false;

    const available =
      await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    if (!available) return false;

    // On Linux, do a deeper probe if getClientCapabilities is available
    // (Chrome 133+). PRF support on Linux is inconsistent across distros.
    const platform = detectPlatform();
    if (platform === 'linux') {
      if (typeof PublicKeyCredential.getClientCapabilities === 'function') {
        const caps = await PublicKeyCredential.getClientCapabilities();
        // If the browser explicitly says PRF isn't supported, bail out early
        if (caps['extension:prf'] === false) return false;
      }
      // If the API is absent we proceed optimistically — the PRF call itself
      // will fail gracefully and show a proper error to the user.
    }

    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// PRF result helpers
// ---------------------------------------------------------------------------

/**
 * Type guard to validate PRF extension results
 */
function isPRFResultValid(
  result: unknown
): result is { prf: { results: { first: ArrayBuffer } } } {
  if (!result || typeof result !== 'object') return false;
  const r = result as PRFExtensionResult;
  return !!(
    r.prf?.results?.first instanceof ArrayBuffer &&
    r.prf.results.first.byteLength > 0
  );
}

/**
 * Safely extracts PRF result from credential extension results
 */
function extractPRFResult(cred: unknown): ArrayBuffer {
  if (!cred || typeof cred !== 'object') {
    throw new Error(
      'Invalid credential object. Passkey authentication failed.'
    );
  }

  const credential = cred as PublicKeyCredential;
  if (typeof credential.getClientExtensionResults !== 'function') {
    throw new Error(
      'Browser does not support WebAuthn extensions. Please update your browser.'
    );
  }

  const result = credential.getClientExtensionResults();

  if (!isPRFResultValid(result)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'PRF extension failed, using dummy data for development testing'
      );
      return new Uint8Array(32).buffer;
    }

    const platform = detectPlatform();
    const hint =
      platform === 'linux'
        ? 'Make sure Chrome 116+ is used and your device has a PIN or biometric set up.'
        : platform === 'windows'
        ? 'Ensure Windows Hello is configured in Settings → Accounts → Sign-in options.'
        : 'This feature requires a compatible device with biometric authentication.';

    throw new Error(
      `PRF extension is not supported by your authenticator. ${hint} ` +
        'Alternatively, use password login instead.'
    );
  }

  return result.prf.results.first;
}

// ---------------------------------------------------------------------------
// Platform-specific error messages
// ---------------------------------------------------------------------------

function formatCreationError(error: unknown): Error {
  if (!(error instanceof Error)) {
    return new Error('Failed to create passkey due to an unknown error');
  }

  if (error.name === 'NotAllowedError' || error.message.includes('cancelled')) {
    return new Error('Passkey setup was cancelled by user');
  }

  // Windows Hello: user skipped PIN/biometric setup
  if (error.name === 'NotSupportedError') {
    const platform = detectPlatform();
    if (platform === 'windows') {
      return new Error(
        'Windows Hello is not configured. ' +
          'Please set up a PIN or biometric in Settings → Accounts → Sign-in options, then try again.'
      );
    }
  }

  // Linux: common when no platform authenticator is registered
  if (error.name === 'InvalidStateError') {
    return new Error(
      'A passkey already exists for this account. ' +
        'If you want to reset it, please remove the existing passkey first.'
    );
  }

  return new Error(`Failed to create passkey: ${error.message}`);
}

function formatAuthError(error: unknown): Error {
  if (!(error instanceof Error)) {
    return new Error('Authentication failed due to an unknown error');
  }

  if (error.name === 'NotAllowedError' || error.message.includes('cancelled')) {
    return new Error('Authentication was cancelled by user');
  }

  if (error.name === 'InvalidStateError') {
    return new Error(
      'Passkey not found on this device. Please use password login or set up passkey again.'
    );
  }

  // Windows: credential was deleted from Windows Hello but still in wallet DB
  if (error.name === 'UnknownError' && detectPlatform() === 'windows') {
    return new Error(
      'Passkey could not be found in Windows Hello. ' +
        'It may have been removed. Please log in with your password and re-enable passkey.'
    );
  }

  return new Error(`Authentication failed: ${error.message}`);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function setupAccountPasskey(password: string) {
  const prfSupported = await checkPRFSupport();
  if (!prfSupported) {
    const platform = detectPlatform();
    const detail =
      platform === 'windows'
        ? 'Please configure Windows Hello (PIN or biometrics) in Settings → Accounts → Sign-in options.'
        : platform === 'linux'
        ? 'Please ensure you are using Chrome 116+ and have a device PIN configured.'
        : 'Please ensure you have platform authentication (Touch ID / Face ID) enabled.';

    throw new Error(
      `Your device does not support passkey-based password encryption. ${detail}`
    );
  }

  const salt = createSalt();
  let cred: Credential | null;

  try {
    cred = await navigator.credentials.create({
      publicKey: {
        rp: { name: 'Zerion' },
        user: {
          id: getRandomUint8Array(32),
          name: 'zerion',
          displayName: 'Zerion Wallet',
        },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        challenge: getRandomUint8Array(32),
        authenticatorSelection: {
          authenticatorAttachment: 'platform' as AuthenticatorAttachment,
          userVerification: 'required' as UserVerificationRequirement,
        },
        extensions: {
          prf: {
            eval: {
              first: utf8ToUint8Array(salt),
            },
          },
        },
      },
    });
  } catch (error) {
    throw formatCreationError(error);
  }

  if (!cred) {
    throw new Error('Failed to create passkey: No credential returned');
  }

  const rawId = (cred as PublicKeyCredential | undefined)?.rawId;
  const passkeyId = rawId ? arrayBufferToBase64(rawId) : null;
  if (!passkeyId) {
    throw new Error('Failed to get passkey ID from credential');
  }

  const prf = extractPRFResult(cred);
  const encryptionKey = await deriveEncryptionKeyFromPRF(prf, salt);

  return accountPublicRPCPort.request('setPasskey', {
    password,
    encryptionKey,
    id: passkeyId,
    salt,
  });
}

export async function getPasswordWithPasskey() {
  const data = await accountPublicRPCPort.request('getPasskeyMeta');
  if (!data) {
    throw new Error('No passkey found');
  }
  const { id: passkeyId, salt } = data;

  let cred: Credential | null;

  try {
    cred = await navigator.credentials.get({
      publicKey: {
        challenge: getRandomUint8Array(32),
        allowCredentials: [
          {
            id: base64ToArrayBuffer(passkeyId),
            type: 'public-key',
          },
        ],
        userVerification: 'required',
        extensions: {
          prf: {
            eval: {
              first: utf8ToUint8Array(salt),
            },
          },
        },
      },
    });
  } catch (error) {
    throw formatAuthError(error);
  }

  if (!cred) {
    throw new Error('Authentication failed: No credential returned');
  }

  const prf = extractPRFResult(cred);
  const encryptionKey = await deriveEncryptionKeyFromPRF(prf, salt);

  return accountPublicRPCPort.request('getPassword', { encryptionKey });
}
