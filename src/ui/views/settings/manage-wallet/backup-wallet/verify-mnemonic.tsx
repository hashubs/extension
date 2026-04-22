import { invariant } from '@/shared/invariant';
import { isSessionExpiredError } from '@/shared/isSessionExpiredError';
import { apostrophe } from '@/shared/typography';
import { decodeMasked } from '@/shared/wallet/encode-locally';
import { zeroizeAfterSubmission } from '@/shared/zeroize-submission';
import { Header } from '@/ui/components/header';
import { MnemonicGrid } from '@/ui/components/Mnemonic';
import {
  usePendingRecoveryPhrase,
  useRecoveryPhrase,
} from '@/ui/hooks/useRecoveryPhrase';
import { Alert, Button } from '@/ui/ui-kit';
import { useCallback, useEffect, useState } from 'react';

const WORD_COUNT = 12;

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
  const [value, setValue] = useState<string[]>(() =>
    Array(WORD_COUNT).fill('')
  );
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

  const verifyRecoveryPhrase = useCallback(
    (value: string) => {
      invariant(recoveryPhraseMasked, 'recoveryPhrase is missing');
      setValidationError(false);
      const recoveryPhrase = decodeMasked(recoveryPhraseMasked);
      if (recoveryPhrase.toLowerCase() === value.toLowerCase()) {
        zeroizeAfterSubmission();
        onSuccess();
      } else {
        setValidationError(true);
      }
    },
    [recoveryPhraseMasked, onSuccess]
  );

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <Header title="VerifyMnemonicView" onBack={onBack} />
      <div className="flex-1 flex flex-col p-4 pt-0 space-y-4 no-scrollbar overflow-y-auto">
        <div className="flex-1 flex flex-col gap-4">
          <div className="inline-flex flex-col gap-1">
            <h2 className="text-lg font-semibold">Confirm Recovery Phrase</h2>
            <p className="text-muted-foreground">
              This step ensures you{apostrophe}ve saved your recovery phrase
              correctly
            </p>
          </div>

          {validationError && (
            <Alert
              variant="danger"
              title="Invalid Phrase"
              description="The words you entered do not match the recovery phrase."
            />
          )}

          <MnemonicGrid count={12} words={value} onChange={setValue} />
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => verifyRecoveryPhrase(value.join(' '))}
          disabled={isLoading}
        >
          Verify
        </Button>
      </div>
    </div>
  );
}
