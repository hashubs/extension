import { accountPublicRPCPort, walletPort } from '@/shared/channels';
import { IdempotentRequest } from '@/shared/IdempotentRequest';
import { invariant } from '@/shared/invariant';
import { queryClient } from '@/shared/query-client/queryClient';
import { setCurrentAddress } from '@/shared/request/internal/setCurrentAddress';
import { assertKnownEcosystems } from '@/shared/wallet/shared';
import { WalletSetupStatusView } from '@/ui/components/wallet-setup/wallet-success';
import { QUERY_WALLET } from '@/ui/hooks/request/internal/useWallet';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export function GenerateWalletView({
  onBack,
  onSuccess,
  onSessionExpired,
}: {
  onBack: () => void;
  onSuccess: () => void;
  onSessionExpired: () => void;
}) {
  const [params] = useSearchParams();
  const ecosystems = params.getAll('ecosystems');
  invariant(ecosystems.length > 0, 'Must provide ecosystems get-param');
  assertKnownEcosystems(ecosystems);

  const [idempotentRequest] = useState(() => new IdempotentRequest());

  const {
    mutate: generateMnemonicWallet,
    data: generatedWallets,
    isPending: isLoading,
    status,
  } = useMutation({
    mutationFn: async () => {
      await new Promise((r) => setTimeout(r, 1000));
      return walletPort.request('uiGenerateMnemonic', { ecosystems });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_WALLET.walletGroups });
    },
    onError: (error: any) => {
      if (error?.message?.includes('expired')) {
        onSessionExpired();
      }
    },
  });

  useEffect(() => {
    if (status === 'idle') {
      generateMnemonicWallet();
    }
  }, [generateMnemonicWallet, status]);

  const { mutate: finalize, ...finalizeMutation } = useMutation({
    mutationFn: async (address: string) => {
      return idempotentRequest.request(address, async () => {
        await accountPublicRPCPort.request('saveUserAndWallet');
        return setCurrentAddress({ address });
      });
    },
  });

  useEffect(() => {
    if (generatedWallets) {
      finalize(generatedWallets[0].address);
    }
  }, [generatedWallets, finalize]);

  const isReady = !isLoading && !finalizeMutation.isPending;

  const autoFocusRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (isReady) {
      setTimeout(() => autoFocusRef.current?.focus(), 100);
    }
  }, [isReady]);

  return (
    <WalletSetupStatusView
      title={isReady ? 'Wallet Created' : 'Generating...'}
      loadingTitle="Creating secure phrase..."
      successTitle="Successfully Created!"
      successDescription="Your new recovery phrase is securely encrypted and stored."
      wallets={generatedWallets || []}
      isPending={isLoading}
      isSuccess={isReady}
      isError={finalizeMutation.isError}
      error={finalizeMutation.error}
      onBack={onBack}
      onContinue={onSuccess}
      buttonText="View Wallets"
    />
  );
}
