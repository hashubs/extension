import { prepareUserInputSeedOrPrivateKey } from '@/shared/prepareUserInputSeedOrPrivateKey';
import { validateMnemonicOrPrivateKey } from '@/ui/components/ImportWallet/validation';
import { Alert, Button } from '@/ui/ui-kit';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '../section-header';
import { useImportWallet } from './import-context';

export function ImportPrivateKey() {
  const { setPrivateKey, setMethod } = useImportWallet();
  const navigate = useNavigate();

  const [key, setKey] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const secretKey = prepareUserInputSeedOrPrivateKey(key);
    const validity = validateMnemonicOrPrivateKey({
      recoveryInput: secretKey,
    });
    if (!validity.valid) {
      setError(validity.message);
      return;
    }

    setMethod('privateKey');
    setPrivateKey(key.trim());
    navigate('/onboarding/import/password');
  }

  return (
    <>
      <SectionHeader
        title="Private key"
        description="Import an existing wallet with your private key."
      />

      {error && (
        <Alert
          variant="danger"
          title="Invalid Key"
          description={error}
          className="mb-4"
        />
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8 flex-1">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <label
              htmlFor="private-key-input"
              className="text-[0.625rem] font-bold text-muted-foreground uppercase tracking-widest"
            >
              Private Key
            </label>
          </div>
          <input
            id="private-key-input"
            type="password"
            className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3.5 text-on-surface text-sm outline-none transition-all duration-200 placeholder:text-outline-variant focus:border-primary-container focus:ring-2 focus:ring-primary/10"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="0x... or 64-character hex"
            autoComplete="off"
            autoFocus
          />
        </div>

        <div className="mt-auto pt-6">
          <Button variant="primary" size="lg" disabled={!key.trim()}>
            Import wallet
          </Button>
        </div>
      </form>
    </>
  );
}
