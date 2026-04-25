import { isSessionExpiredError } from '@/shared/isSessionExpiredError';
import { apostrophe } from '@/shared/typography';
import { decodeMasked } from '@/shared/wallet/encode-locally';
import { zeroizeAfterSubmission } from '@/shared/zeroize-submission';
import { Footer, Layout } from '@/ui/components/layout';
import { SecretInput } from '@/ui/components/secret-input';
import { useDeferredMount } from '@/ui/hooks/useDeferredMount';
import {
  usePendingRecoveryPhrase,
  useRecoveryPhrase,
} from '@/ui/hooks/useRecoveryPhrase';
import { Button } from '@/ui/ui-kit';
import { useCallback, useEffect, useState } from 'react';

export function VerifyMnemonicView({
  groupId,
  onSuccess,
  onSessionExpired,
  onBack,
}: {
  groupId: string | null;
  onSuccess: () => void;
  onSessionExpired: () => void;
  onBack: () => void;
}) {
  const ready = useDeferredMount(250);
  const [value, setValue] = useState('');
  const [validationError, setValidationError] = useState(false);

  const isPendingWallet = !groupId;
  const existingRecoveryPhraseQuery = useRecoveryPhrase({
    groupId,
    enabled: !isPendingWallet,
  });

  const pendingRecoveryPhraseQuery = usePendingRecoveryPhrase({
    enabled: isPendingWallet,
  });

  const {
    data: recoveryPhraseMasked,
    isLoading,
    isError,
    error,
  } = isPendingWallet
    ? pendingRecoveryPhraseQuery
    : existingRecoveryPhraseQuery;

  useEffect(() => {
    if (isError && isSessionExpiredError(error)) {
      onSessionExpired();
    }
  }, [isError, error, onSessionExpired]);

  const verifyRecoveryPhrase = useCallback(() => {
    if (!recoveryPhraseMasked) return;

    setValidationError(false);
    const recoveryPhrase = decodeMasked(recoveryPhraseMasked);
    const cleanedInput = value.trim().toLowerCase();

    if (recoveryPhrase.toLowerCase() === cleanedInput) {
      zeroizeAfterSubmission();
      onSuccess();
    } else {
      setValidationError(true);
    }
  }, [recoveryPhraseMasked, value, onSuccess]);

  return (
    <Layout title="Verify Wallet" onBack={onBack} wrapped={false}>
      <div className="flex-1 space-y-2">
        <div className="inline-flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Confirm Recovery Phrase</h2>
          <p className="text-muted-foreground">
            This step ensures you{apostrophe}ve saved your recovery phrase
            correctly. Please enter the words in order.
          </p>
        </div>

        <SecretInput
          value={value}
          onChange={(val) => {
            setValue(val);
            setValidationError(false);
          }}
          showRevealElement={true}
          autoFocus={ready}
          hint={
            validationError && (
              <div
                className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium animate-in fade-in slide-in-from-top-1"
                role="alert"
              >
                The words you entered do not match the recovery phrase.
              </div>
            )
          }
        />
      </div>

      <Footer>
        <Button
          variant="primary"
          size="md"
          onClick={verifyRecoveryPhrase}
          disabled={isLoading || !value.trim()}
        >
          Verify
        </Button>
      </Footer>
    </Layout>
  );
}
