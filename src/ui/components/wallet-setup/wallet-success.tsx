import { accountPublicRPCPort, walletPort } from '@/shared/channel';
import { getError } from '@/shared/errors/get-error';
import { IdempotentRequest } from '@/shared/IdempotentRequest';
import { isSessionExpiredError } from '@/shared/isSessionExpiredError';
import { queryClient } from '@/shared/query-client/queryClient';
import { setCurrentAddress } from '@/shared/request/internal/setCurrentAddress';
import { MaskedBareWallet } from '@/shared/types/bare-wallet';
import { useRenderDelay } from '@/ui/components/DelayedRender/DelayedRender';
import { Header } from '@/ui/components/header';
import { ImportBackground, ImportDecoration } from '@/ui/components/wallet';
import { QUERY_WALLET } from '@/ui/hooks/request/internal/useWallet';
import { Button } from '@/ui/ui-kit';
import { useMutation } from '@tanstack/react-query';
import { isTruthy } from 'is-truthy-ts';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const ANIMATION_DURATION = 1500;

export function WalletSuccessView({
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
  const buttonFocusReady = useRenderDelay(ANIMATION_DURATION + 300);
  const [idempotentRequest] = useState(() => new IdempotentRequest());

  const {
    mutate: finalize,
    isSuccess,
    isPending,
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
      // NOTE: Make sure "finalize" is idempotent
      finalize(mnemonics);
    }
  }, [finalize, ready, values]);

  const autoFocusRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (buttonFocusReady) {
      autoFocusRef.current?.focus();
    }
  }, [buttonFocusReady]);

  const successImport = ready && isSuccess;

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      <Header
        title={
          isPending
            ? 'Importing...'
            : isSuccess
            ? 'Successfully Created!'
            : 'Generating...'
        }
        onBack={onBack}
      />

      <div className="flex-1 p-4 relative flex flex-col items-center">
        <div className="absolute inset-0 pointer-events-none">
          <ImportBackground animate={!successImport} />
        </div>

        <div className="flex-1 w-full z-10">
          <ImportDecoration
            wallets={values}
            isLoading={!successImport}
            loadingTitle="Importing wallets"
          />
        </div>

        {isError ? (
          <div className="text-sm text-destructive text-center z-10">
            {getError(error).message}
          </div>
        ) : null}

        {successImport && (
          <div className="mt-auto w-full space-y-4 z-10 animate-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold">Successfully Created!</h2>
              <p className="text-sm text-muted-foreground">
                Your new recovery phrase is securely encrypted and stored.
              </p>
            </div>

            <Button
              ref={autoFocusRef}
              size="md"
              variant="primary"
              onClick={onSuccess}
            >
              View Wallets
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
