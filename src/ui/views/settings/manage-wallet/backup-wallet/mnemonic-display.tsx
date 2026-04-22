import { isSessionExpiredError } from '@/shared/isSessionExpiredError';
import { decodeMasked } from '@/shared/wallet/encode-locally';
import { Header } from '@/ui/components/header';
import { MnemonicGrid } from '@/ui/components/Mnemonic';
import { useCopyToClipboard } from '@/ui/hooks/useCopyToClipboard';
import {
  usePendingRecoveryPhrase,
  useRecoveryPhrase,
} from '@/ui/hooks/useRecoveryPhrase';
import { Button } from '@/ui/ui-kit';
import { useEffect, useState } from 'react';
import { LuEyeOff } from 'react-icons/lu';
import { MdCheck, MdContentCopy } from 'react-icons/md';

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
  const pendingRecoveryPhraseQuery = usePendingRecoveryPhrase({
    enabled: isPendingWallet,
  });

  const [revealed, setRevealed] = useState(false);

  const {
    data: encoded,
    isLoading,
    isError,
    error,
  } = isPendingWallet
    ? pendingRecoveryPhraseQuery
    : existingRecoveryPhraseQuery;

  const recoveryPhrase = encoded ? decodeMasked(encoded) : null;
  const words = recoveryPhrase?.split(' ') ?? [];
  const wordCount = words.length;

  useEffect(() => {
    if (isError && isSessionExpiredError(error)) {
      onSessionExpired();
    }
  }, [isError, error, onSessionExpired]);

  const { handleCopy, isSuccess: isCopySuccess } = useCopyToClipboard({
    text: recoveryPhrase || '',
  });

  const title = needsBackup ? 'Back Up Wallet' : 'Recovery Phrase';

  const copyButton = (
    <Button
      variant="outline"
      size="md"
      onClick={handleCopy}
      icon={isCopySuccess ? MdCheck : MdContentCopy}
      iconPosition="left"
    >
      {isCopySuccess ? 'Copied!' : 'Copy to clipboard'}
    </Button>
  );

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <Header title={title} onBack={onBack} />

      <div className="flex-1 flex flex-col p-4 pt-0 space-y-4 no-scrollbar overflow-y-auto">
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

        <div className="flex-1 flex flex-col gap-4">
          <div
            className="relative p-4 border border-muted rounded-lg overflow-hidden"
            onClick={() => revealed && setRevealed(false)}
            style={{ cursor: revealed ? 'pointer' : 'default' }}
          >
            {!revealed && (
              <div
                className="absolute inset-0 bg-muted/10 z-10 backdrop-blur-md flex flex-col items-center justify-center cursor-pointer gap-2 text-center px-4"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isLoading) return;
                  setRevealed(true);
                }}
              >
                <LuEyeOff size={20} />
                <p className="font-semibold">Tap to View Seed Phrase</p>
                <p className="text-sm text-muted-foreground">
                  Make sure there are no other people or cameras around.
                </p>
              </div>
            )}
            <MnemonicGrid count={wordCount as 12 | 24} words={words} readOnly />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {copyButton}
          {needsBackup && (
            <Button variant="primary" size="md" onClick={onNextStep}>
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
