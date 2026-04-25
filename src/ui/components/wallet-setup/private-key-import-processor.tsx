import { accountPublicRPCPort, walletPort } from '@/shared/channels';
import { IdempotentRequest } from '@/shared/IdempotentRequest';
import { isSessionExpiredError } from '@/shared/isSessionExpiredError';
import { queryClient } from '@/shared/query-client/queryClient';
import { setCurrentAddress } from '@/shared/request/internal/setCurrentAddress';
import { MaskedBareWallet } from '@/shared/types/bare-wallet';
import { useRenderDelay } from '@/ui/components/DelayedRender/DelayedRender';
import { QUERY_WALLET } from '@/ui/hooks/request/internal/useWallet';
import {
  MemoryLocationState,
  useMemoryLocationState,
} from '@/ui/shared/memoryLocationState';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { WalletSetupStatusView } from './wallet-success';

const ANIMATION_DURATION = 1500;

export function PrivateKeyImportProcessor({
  locationStateStore,
  onBack,
  onSessionExpired,
  onSuccess,
}: {
  locationStateStore: MemoryLocationState;
  onBack: () => void;
  onSessionExpired: () => void;
  onSuccess: () => void;
}) {
  const [idempotentRequest] = useState(() => new IdempotentRequest());
  const ready = useRenderDelay(ANIMATION_DURATION);
  const { value: privateKey } = useMemoryLocationState(locationStateStore);

  const {
    mutate: importPrivateKey,
    data: importedWallet,
    isSuccess,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async () => {
      if (!privateKey) {
        throw new Error('Private key session expired or missing');
      }

      return idempotentRequest.request(JSON.stringify(privateKey), async () => {
        const wallet = await walletPort.request(
          'uiImportPrivateKey',
          privateKey
        );
        await accountPublicRPCPort.request('saveUserAndWallet');
        await setCurrentAddress({ address: wallet.address });
        return wallet as unknown as MaskedBareWallet;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_WALLET.walletGroups });
    },
  });

  useEffect(() => {
    if (ready && !isPending && !isSuccess && !isError) {
      importPrivateKey();
    }
  }, [ready, isPending, isSuccess, isError, importPrivateKey]);

  useEffect(() => {
    if (isError && isSessionExpiredError(error)) {
      onSessionExpired();
    }
  }, [isError, error, onSessionExpired]);

  const isPendingTotal = !isSuccess && !isError;

  return (
    <WalletSetupStatusView
      title="Importing Private Key"
      loadingTitle="Securing your account..."
      successTitle="Import Successful!"
      successDescription="Your private key wallet has been added successfully."
      wallets={importedWallet ? [importedWallet] : []}
      isPending={isPendingTotal}
      isSuccess={isSuccess}
      isError={isError}
      error={error as Error}
      onBack={onBack}
      onContinue={onSuccess}
    />
  );
}
