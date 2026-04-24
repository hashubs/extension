import { accountPublicRPCPort, walletPort } from '@/shared/channel';
import { IdempotentRequest } from '@/shared/IdempotentRequest';
import { isSessionExpiredError } from '@/shared/isSessionExpiredError';
import { queryClient } from '@/shared/query-client/queryClient';
import { setCurrentAddress } from '@/shared/request/internal/setCurrentAddress';
import { MaskedBareWallet } from '@/shared/types/bare-wallet';
import { useRenderDelay } from '@/ui/components/DelayedRender/DelayedRender';
import { QUERY_WALLET } from '@/ui/hooks/request/internal/useWallet';
import { useMutation } from '@tanstack/react-query';
import { isTruthy } from 'is-truthy-ts';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { WalletSetupStatusView } from './wallet-success';

const ANIMATION_DURATION = 1500;

export function MnemonicImportProcessor({
  onBack,
  onSessionExpired,
  onSuccess,
}: {
  onBack: () => void;
  onSessionExpired: () => void;
  onSuccess: () => void;
}) {
  const location = useLocation();
  const values = (location.state?.values || []) as MaskedBareWallet[];

  const ready = useRenderDelay(ANIMATION_DURATION);
  const [idempotentRequest] = useState(() => new IdempotentRequest());

  const {
    mutate: finalize,
    isSuccess,
    isError,
    error,
  } = useMutation({
    mutationFn: async (
      mnemonics: NonNullable<MaskedBareWallet['mnemonic']>[]
    ) => {
      return idempotentRequest.request(JSON.stringify(mnemonics), async () => {
        const data = await walletPort.request('uiImportSeedPhrase', mnemonics);
        await accountPublicRPCPort.request('saveUserAndWallet');
        if (data?.address) {
          await setCurrentAddress({ address: data.address });
        }
        return data;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_WALLET.walletGroups });
    },
  });

  useEffect(() => {
    if (isError && isSessionExpiredError(error)) {
      onSessionExpired();
    }
  }, [isError, error, onSessionExpired]);

  useEffect(() => {
    if (ready && values.length > 0) {
      const mnemonics = values
        .map((wallet) => wallet.mnemonic)
        .filter(isTruthy);
      finalize(mnemonics);
    }
  }, [finalize, ready, values]);

  const isPendingTotal = !isSuccess && !isError;

  return (
    <WalletSetupStatusView
      title="Importing Wallet"
      loadingTitle="Finalizing import..."
      successTitle="Successfully Imported!"
      successDescription="Your recovery phrase has been added to your wallet."
      wallets={values}
      isPending={isPendingTotal}
      isSuccess={isSuccess}
      isError={isError}
      error={error as Error}
      onBack={onBack}
      onContinue={onSuccess}
    />
  );
}
