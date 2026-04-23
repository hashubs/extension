import { isSessionExpiredError } from '@/shared/isSessionExpiredError';
import { assertSignerContainer } from '@/shared/types/validators';
import { Header } from '@/ui/components/header';
import { Reveal } from '@/ui/components/Reveal';
import { ViewLoading } from '@/ui/components/view-loading';
import { useWalletGroupByGroupId } from '@/ui/hooks/request/internal/useWallet';
import { useCopyToClipboard } from '@/ui/hooks/useCopyToClipboard';
import { Button } from '@/ui/ui-kit';
import { useEffect } from 'react';
import { decodeMasked } from 'src/shared/wallet/encode-locally';
import { usePrivateKey } from './usePrivateKey';

export function RevealPrivateKeyView({
  groupId,
  address,
  onSessionExpired,
  onBack,
}: {
  groupId: string;
  address: string;
  onSessionExpired: () => void;
  onBack: () => void;
}) {
  const { data: walletGroup, isLoading } = useWalletGroupByGroupId({ groupId });

  const {
    data: privateKeyMasked,
    isLoading: isLoadingPrivateKey,
    isError: isErrorPrivateKey,
    error: errorPrivateKey,
  } = usePrivateKey(address);

  const privateKey = privateKeyMasked ? decodeMasked(privateKeyMasked) : null;

  const { handleCopy, isSuccess: isCopySuccess } = useCopyToClipboard({
    text: privateKey || '',
  });

  useEffect(() => {
    if (isErrorPrivateKey && isSessionExpiredError(errorPrivateKey)) {
      onSessionExpired();
    }
  }, [isErrorPrivateKey, errorPrivateKey, onSessionExpired]);

  if (isLoading || !walletGroup) {
    return null;
  }

  assertSignerContainer(walletGroup.walletContainer);

  if (isLoadingPrivateKey) {
    return <ViewLoading onBack={onBack} />;
  }

  if (!privateKey) {
    if (isErrorPrivateKey && isSessionExpiredError(errorPrivateKey)) {
      return null;
    }
    throw new Error('Could not get private key');
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <Header title="Reveal Private Key" onBack={onBack} />

      <div className="flex-1 flex flex-col p-4 pt-0 space-y-4 no-scrollbar overflow-y-auto">
        <div>
          <h2 className="text-lg font-semibold">Export Private Key</h2>
          <p className="text-muted-foreground text-sm">
            Your private key can be used to access all of your funds. Do not
            share it with anyone
          </p>
        </div>

        <Reveal label="Tap to View Private Key">
          <p className="mono text-sm break-all leading-relaxed select-all">
            {privateKey}
          </p>
        </Reveal>

        <Button variant="primary" onClick={handleCopy}>
          {isCopySuccess ? '✓ Copied' : 'Copy'}
        </Button>
      </div>
    </div>
  );
}
