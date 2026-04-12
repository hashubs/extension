import { accountPublicRPCPort, walletPort } from '@/shared/channel';
import { isSessionExpiredError } from '@/shared/isSessionExpiredError';
import { setCurrentAddress } from '@/shared/request/internal/setCurrentAddress';
import { decodeMasked } from '@/shared/wallet/encode-locally';
import { MnemonicComponent } from '@/ui/components/Mnemonic';
import { useCopyToClipboard } from '@/ui/hooks/useCopyToClipboard';
import { usePendingRecoveryPhrase } from '@/ui/hooks/useRecoveryPhrase';
import { Alert, Button } from '@/ui/ui-kit';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MdCheck, MdContentCopy, MdVisibility } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { SessionExpired } from 'src/shared/errors/errors';
import { ONBOARDING_ROUTES } from '../routes';
import { SectionHeader } from '../section-header';

export async function ensurePendingWalletAndUser() {
  const wallet = await walletPort.request('getPendingWallet');
  if (!wallet) {
    throw new SessionExpired();
  }
  await accountPublicRPCPort.request('saveUserAndWallet');
  await setCurrentAddress({ address: wallet.address });
  return wallet;
}

export function BackupPhrase({
  setPageMetadata,
}: {
  setPageMetadata?: (
    metadata: { onBack?: () => void; backIconType?: 'arrow' | 'close' } | null
  ) => void;
} = {}) {
  const navigate = useNavigate();
  const [view, setView] = useState<'display' | 'verify'>('display');

  useEffect(() => {
    if (!setPageMetadata) return;

    if (view === 'verify') {
      setPageMetadata({
        onBack: () => setView('display'),
        backIconType: 'arrow',
      });
    } else {
      setPageMetadata(null);
    }

    return () => setPageMetadata(null);
  }, [view, setPageMetadata]);

  const {
    data: encodedMnemonic,
    error,
    isError,
  } = usePendingRecoveryPhrase({
    enabled: true,
  });

  const mnemonicWords = useMemo(() => {
    if (!encodedMnemonic) return [];
    return decodeMasked(encodedMnemonic).split(/\s+/);
  }, [encodedMnemonic]);

  const handleSessionExpired = useCallback(
    () =>
      navigate(`../../${ONBOARDING_ROUTES.SESSION_EXPIRED}`, {
        replace: true,
      }),
    [navigate]
  );

  const handleSkip = useCallback(
    () =>
      navigate(`../${ONBOARDING_ROUTES.CREATE.PROCESSING}`, {
        state: { isBackedUp: false },
      }),
    [navigate]
  );

  const handleSuccess = useCallback(
    () =>
      navigate(`../${ONBOARDING_ROUTES.CREATE.PROCESSING}`, {
        state: { isBackedUp: true },
      }),
    [navigate]
  );

  useEffect(() => {
    if (isError && isSessionExpiredError(error)) {
      handleSessionExpired();
    }
  }, [isError, error, handleSessionExpired]);

  if (view === 'display') {
    return (
      <PhraseDisplay
        words={mnemonicWords}
        onContinue={() => setView('verify')}
        onSkip={() => handleSkip()}
      />
    );
  }

  return (
    <PhraseVerify
      originalWords={mnemonicWords}
      onSuccess={() => handleSuccess()}
    />
  );
}

const WORD_COUNT = 12;

function PhraseDisplay({
  words,
  onContinue,
  onSkip,
}: {
  words: string[];
  onContinue: () => void;
  onSkip: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const { handleCopy, isSuccess: isCopySuccess } = useCopyToClipboard({
    text: words.join(' ').trim(),
  });

  return (
    <>
      <div className="mb-6 shrink-0">
        <h1 className="text-[clamp(1.75rem,4vw,2rem)] font-extrabold m-0 tracking-[-0.02em] leading-tight">
          Back up your recovery phrase
        </h1>
      </div>

      <div
        className="relative"
        onClick={() => revealed && setRevealed(false)}
        style={{ cursor: revealed ? 'pointer' : 'default' }}
      >
        {!revealed && (
          <div
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              setRevealed(true);
            }}
            className="absolute inset-0 bg-surface z-10 flex border border-muted-foreground/10 items-center justify-center rounded-lg"
          >
            <MdVisibility className="size-8 text-black/80" />
          </div>
        )}
        <MnemonicComponent
          value={words}
          phraseMode={12}
          setValue={() => {}}
          readOnly={revealed}
        />
      </div>

      <Button
        variant="outline"
        size="md"
        onClick={handleCopy}
        icon={isCopySuccess ? MdCheck : MdContentCopy}
        iconPosition="left"
        className="mt-4"
      >
        {isCopySuccess ? 'Copied!' : 'Copy to clipboard'}
      </Button>

      <div className="mt-auto pt-4 border-t border-muted-foreground/10 shrink-0 flex flex-col">
        <label className="flex items-start gap-4 cursor-pointer p-3 rounded-lg mb-4">
          <input
            type="checkbox"
            className="w-5 h-5 rounded-lg border-2 border-outline-variant accent-primary-container cursor-pointer shrink-0 mt-px"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          <span className="text-sm text-on-surface-variant leading-normal transition-colors duration-200 group-hover:text-on-surface">
            I have saved my recovery phrase in a safe and secure location.
          </span>
        </label>

        <div className="flex gap-3 w-full">
          <Button
            variant="default"
            size="lg"
            className="flex-3 md:flex-2"
            onClick={onSkip}
          >
            Do it later
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-2 md:flex-3"
            disabled={!confirmed}
            onClick={onContinue}
          >
            Continue
          </Button>
        </div>
      </div>
    </>
  );
}

function PhraseVerify({
  originalWords,
  onSuccess,
}: {
  originalWords: string[];
  onSuccess: () => void;
}) {
  const [value, setValue] = useState(() => Array(WORD_COUNT).fill(''));
  const [error, setError] = useState(false);

  const isComplete = value.every((w) => w.trim().length > 0);

  function handleVerify() {
    setError(false);
    if (
      value.join(' ').toLowerCase() === originalWords.join(' ').toLowerCase()
    ) {
      onSuccess();
    } else {
      setError(true);
    }
  }

  return (
    <>
      <SectionHeader
        title="Verify your recovery phrase"
        description="Please enter each word in the correct order to confirm your backup."
      />

      {error && (
        <Alert
          variant="danger"
          title="Incorrect Phrase"
          description="The phrase you entered doesn't match your recovery phrase. Please check and try again."
          className="mb-4"
        />
      )}

      <MnemonicComponent value={value} phraseMode={12} setValue={setValue} />

      <div className="flex flex-col gap-4 mt-auto">
        <Button
          variant="primary"
          size="lg"
          disabled={!isComplete}
          onClick={handleVerify}
        >
          Verify
        </Button>
      </div>
    </>
  );
}
