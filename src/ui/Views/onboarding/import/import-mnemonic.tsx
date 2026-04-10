import { prepareUserInputSeedOrPrivateKey } from '@/shared/prepareUserInputSeedOrPrivateKey';
import { validateMnemonicOrPrivateKey } from '@/ui/components/ImportWallet/validation';
import { MnemonicComponent } from '@/ui/components/Mnemonic';
import { Alert, Button } from '@/ui/ui-kit';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '../section-header';
import { useImportWallet } from './import-context';

const WORD_COUNT_24 = 24;

export function ImportMnemonic() {
  const { setPhrase } = useImportWallet();
  const navigate = useNavigate();

  const [phraseMode, setPhraseMode] = useState<12 | 24>(12);
  const [value, setValue] = useState<string[]>(() =>
    Array(WORD_COUNT_24).fill('')
  );
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const activeWords = value.slice(0, phraseMode);
    const phrase = activeWords.join(' ').trim();
    const secretKey = prepareUserInputSeedOrPrivateKey(phrase);
    const validity = validateMnemonicOrPrivateKey({
      recoveryInput: secretKey,
    });
    if (!validity.valid) {
      setError(validity.message);
      return;
    }

    setPhrase(phrase);
    navigate('/onboarding/import/select-wallets');
  }

  function togglePhraseMode() {
    setPhraseMode((current) => (current === 12 ? 24 : 12));
  }

  const activeCount = phraseMode;
  const filledCount = value
    .slice(0, phraseMode)
    .filter((w) => w.trim().length > 0).length;

  return (
    <>
      <SectionHeader
        title="Recovery phrase"
        description={`Import an existing wallet with your ${phraseMode}-word recovery phrase.`}
      />

      {error && (
        <Alert
          variant="danger"
          title="Invalid Phrase"
          description={error}
          className="mb-4"
        />
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8 flex-1">
        <MnemonicComponent
          phraseMode={phraseMode}
          value={value}
          setValue={setValue}
        />

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="bg-transparent border-none p-0 text-[0.8125rem] font-semibold text-muted-foreground/80 cursor-pointer underline underline-offset-[3px] transition-colors duration-200 hover:text-muted-foreground/50"
            onClick={togglePhraseMode}
          >
            Use {phraseMode === 12 ? '24' : '12'}-word phrase instead
          </button>
        </div>

        <div className="mt-auto pt-6">
          <Button
            variant="primary"
            size="lg"
            disabled={filledCount < activeCount}
          >
            Import wallet
          </Button>
        </div>
      </form>
    </>
  );
}
