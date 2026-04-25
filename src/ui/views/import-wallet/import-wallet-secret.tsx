import { prepareUserInputSeedOrPrivateKey } from '@/shared/prepareUserInputSeedOrPrivateKey';
import { SeedType } from '@/shared/seed-type';
import { ValidationResult } from '@/shared/validation/ValidationResult';
import { isValidMnemonic, isValidPrivateKey } from '@/shared/validation/wallet';
import { encodeForMasking } from '@/shared/wallet/encode-locally';
import { Footer, Layout } from '@/ui/components/layout';
import { SecretInput } from '@/ui/components/secret-input';
import { useDeferredMount } from '@/ui/hooks/useDeferredMount';
import type { MemoryLocationState } from '@/ui/shared/memoryLocationState';
import { Button } from '@/ui/ui-kit';
import { useState } from 'react';
import { LuShieldCheck } from 'react-icons/lu';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MNEMONIC_STEPS,
  PRIVATE_KEY_STEPS,
  SHARED_IMPORT_STEPS,
} from './constants';

function getSeedType(value: string) {
  if (isValidMnemonic(value)) {
    return SeedType.mnemonic;
  } else if (isValidPrivateKey(value)) {
    return SeedType.privateKey;
  } else {
    return null;
  }
}

export function validate({
  recoveryInput,
}: {
  recoveryInput: string;
}): ValidationResult {
  if (recoveryInput.trim().split(/\s+/).length > 1) {
    if (isValidMnemonic(recoveryInput)) {
      return { valid: true, message: '' };
    } else {
      return { valid: false, message: 'Invalid recovery phrase' };
    }
  } else {
    if (isValidPrivateKey(recoveryInput)) {
      return { valid: true, message: '' };
    } else {
      return { valid: false, message: 'Invalid private key' };
    }
  }
}

export function ImportWalletSecretView({
  locationStateStore,
}: {
  locationStateStore: MemoryLocationState;
}) {
  const { pathname: currentPath } = useLocation();
  const navigate = useNavigate();
  const ready = useDeferredMount(250);
  const [inputValue, setInputValue] = useState('');
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);

  const handleImport = () => {
    let value = prepareUserInputSeedOrPrivateKey(inputValue);

    if (value.includes(' ')) {
      value = value.toLowerCase();
    }

    if (!value) return;

    const validity = validate({ recoveryInput: value });
    setValidationResult(validity);
    if (!validity.valid) return;

    const seedType = getSeedType(value);
    if (seedType == null) {
      throw new Error('Unexpected input value');
    }

    const encoded = encodeForMasking(value);
    /**
     * Use relative-friendly pathing.
     * The current path is /import-wallet/secret, but mnemonic/private-key
     * routes are siblings at /import-wallet/...
     */
    const base = currentPath.replace(/\/secret\/?$/, '');

    if (seedType === SeedType.privateKey) {
      const verifyTarget = `${base}/private-key/${PRIVATE_KEY_STEPS.VERIFY}`;
      const successTarget = `${base}/private-key/${SHARED_IMPORT_STEPS.SUCCESS}`;

      locationStateStore.set(verifyTarget, encoded);
      locationStateStore.set(successTarget, encoded);

      navigate(`../private-key/${PRIVATE_KEY_STEPS.VERIFY}?state=memory`);
    } else if (seedType === SeedType.mnemonic) {
      // Set for Mnemonic sub-paths
      locationStateStore.set(
        `${base}/mnemonic/${MNEMONIC_STEPS.VERIFY}`,
        encoded
      );
      locationStateStore.set(
        `${base}/mnemonic/${MNEMONIC_STEPS.DISCOVERY}`,
        encoded
      );
      locationStateStore.set(
        `${base}/mnemonic/${SHARED_IMPORT_STEPS.SUCCESS}`,
        encoded
      );

      navigate(`../mnemonic/${MNEMONIC_STEPS.VERIFY}?state=memory`);
    }
  };

  return (
    <Layout title="Import Wallet" onBack={() => navigate(-1)} wrapped={false}>
      <div className="flex-1 space-y-2">
        <h2 className="text-xl font-bold tracking-tight">
          Enter Recovery Phrase or Private Key
        </h2>

        <SecretInput
          showRevealElement={true}
          autoFocus={ready}
          value={inputValue}
          onChange={(val) => {
            setInputValue(val);
            setValidationResult(null);
          }}
          label="Use spaces between words if using a recovery phrase"
          hint={
            validationResult?.valid === false && (
              <div
                className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium animate-in fade-in slide-in-from-top-1"
                role="alert"
              >
                {validationResult.message}
              </div>
            )
          }
        />
      </div>
      <Footer>
        <div className="flex items-center justify-center gap-2 py-1 px-3 rounded-full bg-muted/30 self-center">
          <LuShieldCheck className="text-teal-500 w-4 h-4" />
          <span className="text-[11px] font-medium text-muted-foreground">
            Your keys never leave this device
          </span>
        </div>
        <Button
          onClick={handleImport}
          variant="primary"
          disabled={!inputValue.trim()}
        >
          Import
        </Button>
      </Footer>
    </Layout>
  );
}
