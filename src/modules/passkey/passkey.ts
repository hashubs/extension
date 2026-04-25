import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  createSalt,
  deriveEncryptionKeyFromPRF,
  getRandomUint8Array,
  utf8ToUint8Array,
} from '@/modules/crypto';
import { accountPublicRPCPort } from '@/shared/channels';

const isDev = process.env.NODE_ENV === 'development';

// ---------------------------------------------------------------------------
// Platform detection
// ---------------------------------------------------------------------------

type Platform = 'macos' | 'windows' | 'linux' | 'android' | 'ios' | 'unknown';

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  // iOS must be checked before macOS — iPadOS 13+ sends a "Macintosh" UA
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
// Dev-mode dummy PRF
// ---------------------------------------------------------------------------

/**
 * Derives a deterministic 32-byte dummy PRF output from a credential's rawId.
 * Used only in development when the authenticator returns prf.enabled = false.
 *
 * Determinism is critical: setup and get must produce the same key for the
 * same credential, otherwise decryption will always fail in dev mode.
 */
async function devDummyPRF(rawId: ArrayBuffer): Promise<ArrayBuffer> {
  // SHA-256 of the rawId gives a stable 32-byte value tied to that credential
  return crypto.subtle.digest('SHA-256', rawId);
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
 * On Linux, PRF support is inconsistent — UVPAA can return true while PRF
 * is still not available. We do an extra probe via getClientCapabilities()
 * (Chrome 133+) to detect this early.
 */
export async function checkPRFSupport(): Promise<boolean> {
  if (isDev) return true;

  try {
    if (!window.PublicKeyCredential) return false;

    const available =
      await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    if (!available) return false;

    if (detectPlatform() === 'linux') {
      if (typeof PublicKeyCredential.getClientCapabilities === 'function') {
        const caps = await PublicKeyCredential.getClientCapabilities();
        if (caps['extension:prf'] === false) return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// PRF result helpers
// ---------------------------------------------------------------------------

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
 * Extracts the PRF output from a WebAuthn credential.
 *
 * In development, if the authenticator does not support PRF (prf.enabled = false),
 * we fall back to SHA-256(rawId) as a deterministic dummy. This ensures setup
 * and get always derive the same encryption key for the same credential in dev.
 */
async function extractPRFResult(
  cred: PublicKeyCredential
): Promise<ArrayBuffer> {
  if (typeof cred.getClientExtensionResults !== 'function') {
    throw new Error(
      'Browser does not support WebAuthn extensions. Please update your browser.'
    );
  }

  const result = cred.getClientExtensionResults();

  if (isPRFResultValid(result)) {
    return result.prf.results.first;
  }

  if (isDev) {
    return devDummyPRF(cred.rawId);
  }

  const platform = detectPlatform();
  const hint =
    platform === 'linux'
      ? 'Make sure you are using Chrome 116+ and your device has a PIN or biometric configured.'
      : platform === 'windows'
      ? 'Ensure Windows Hello is configured in Settings → Accounts → Sign-in options.'
      : 'This feature requires a compatible device with biometric authentication (Touch ID, Face ID, etc.).';

  throw new Error(
    `PRF extension is not supported by your authenticator. ${hint} ` +
      'Alternatively, use password login instead.'
  );
}

// ---------------------------------------------------------------------------
// Platform-specific error formatting
// ---------------------------------------------------------------------------

function formatCreationError(error: unknown): Error {
  if (!(error instanceof Error)) {
    return new Error('Failed to create passkey due to an unknown error');
  }
  if (error.name === 'NotAllowedError' || error.message.includes('cancelled')) {
    return new Error('Passkey setup was cancelled');
  }
  if (error.name === 'NotSupportedError' && detectPlatform() === 'windows') {
    return new Error(
      'Windows Hello is not configured. ' +
        'Please set up a PIN or biometric in Settings → Accounts → Sign-in options, then try again.'
    );
  }
  if (error.name === 'InvalidStateError') {
    return new Error(
      'A passkey already exists for this account. ' +
        'Remove the existing passkey first if you want to reset it.'
    );
  }
  return new Error(`Failed to create passkey: ${error.message}`);
}

function formatAuthError(error: unknown): Error {
  if (!(error instanceof Error)) {
    return new Error('Authentication failed due to an unknown error');
  }
  if (error.name === 'NotAllowedError' || error.message.includes('cancelled')) {
    return new Error('Authentication was cancelled');
  }
  if (error.name === 'InvalidStateError') {
    return new Error(
      'Passkey not found on this device. Please use password login or set up passkey again.'
    );
  }
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
        rp: { name: 'Selvo' },
        user: {
          id: getRandomUint8Array(32),
          name: 'selvo',
          displayName: 'Selvo Wallet',
        },
        // ES256 (-7) + RS256 (-257) for broader authenticator compatibility
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },
          { alg: -257, type: 'public-key' },
        ],
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

  const pkCred = cred as PublicKeyCredential;
  const passkeyId = pkCred.rawId ? arrayBufferToBase64(pkCred.rawId) : null;
  if (!passkeyId) {
    throw new Error('Failed to get passkey ID from credential');
  }

  const prf = await extractPRFResult(pkCred);
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

  const pkCred = cred as PublicKeyCredential;
  const prf = await extractPRFResult(pkCred);
  const encryptionKey = await deriveEncryptionKeyFromPRF(prf, salt);

  return accountPublicRPCPort.request('getPassword', { encryptionKey });
}
