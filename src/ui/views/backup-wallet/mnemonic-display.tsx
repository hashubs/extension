import { isSessionExpiredError } from '@/shared/isSessionExpiredError';
import { decodeMasked } from '@/shared/wallet/encode-locally';
import { Footer, Layout } from '@/ui/components/layout';
import { SecretInput } from '@/ui/components/secret-input';
import {
  usePendingRecoveryPhrase,
  useRecoveryPhrase,
} from '@/ui/hooks/useRecoveryPhrase';
import { Button } from '@/ui/ui-kit';
import { useEffect } from 'react';

export function MnemonicDisplayView({
  groupId,
  needsBackup,
  onNextStep,
  onSessionExpired,
  onBack,
}: {
  groupId: string | null;
  needsBackup: boolean;
  onNextStep?: () => void;
  onSessionExpired: () => void;
  onBack: () => void;
}) {
  const isPendingWallet = !groupId;
  const existingRecoveryPhraseQuery = useRecoveryPhrase({
    groupId,
    enabled: !isPendingWallet,
  });

  // For Create Wallet
  const pendingRecoveryPhraseQuery = usePendingRecoveryPhrase({
    enabled: isPendingWallet,
  });

  const {
    data: encoded,
    isLoading,
    isError,
    error,
  } = isPendingWallet
    ? pendingRecoveryPhraseQuery
    : existingRecoveryPhraseQuery;

  const recoveryPhrase = encoded ? decodeMasked(encoded) : null;
  const dummy = Array(12).fill('abandon').join(' ');

  useEffect(() => {
    if (isError && isSessionExpiredError(error)) {
      onSessionExpired();
    }
  }, [isError, error, onSessionExpired]);

  const title = needsBackup ? 'Back Up Wallet' : 'Recovery Phrase';

  return (
    <Layout title={title} onBack={onBack} wrapped={false}>
      <div className="flex-1 space-y-2">
        <div className="inline-flex flex-col gap-1">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-muted-foreground">
            Write down the following words in order and keep them safe. Do not
            take screenshots or store them on internet connected devices.{' '}
            <span className="text-foreground">
              Don't forget seed phrase, or you may lose your coins!
            </span>
          </p>
        </div>

        <SecretInput
          value={recoveryPhrase || dummy}
          readOnly
          showRevealElement={!!recoveryPhrase}
          showCopyButton={!!recoveryPhrase}
        />
      </div>
      {needsBackup && (
        <Footer>
          <Button
            variant="primary"
            size="md"
            onClick={onNextStep}
            disabled={isLoading}
          >
            Continue
          </Button>
        </Footer>
      )}
    </Layout>
  );
}
