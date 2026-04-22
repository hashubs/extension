import { accountPublicRPCPort, walletPort } from '@/shared/channel';
import { IdempotentRequest } from '@/shared/IdempotentRequest';
import { setCurrentAddress } from '@/shared/request/internal/setCurrentAddress';
import { MaskedBareWallet } from '@/shared/types/bare-wallet';
import { useRenderDelay } from '@/ui/components/DelayedRender/DelayedRender';
import { Header } from '@/ui/components/header';
import { Button } from '@/ui/ui-kit';
import { useMutation } from '@tanstack/react-query';
import { isTruthy } from 'is-truthy-ts';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImportBackground, ImportDecoration } from '../../../components';
import { getError } from '@/shared/errors/get-error';

export function OnMount({
  children,
  onMount,
}: React.PropsWithChildren<{ onMount: () => void }>) {
  const onMountRef = useRef(onMount);
  onMountRef.current = onMount;
  useEffect(() => {
    onMountRef.current();
  }, []);
  return children as JSX.Element;
}

const ANIMATION_DURATION = 1500;

export function AddressImportMessages({
  values,
}: {
  values: MaskedBareWallet[];
}) {
  const navigate = useNavigate();

  const ready = useRenderDelay(ANIMATION_DURATION);
  const buttonFocusReady = useRenderDelay(ANIMATION_DURATION + 300);
  const [idempotentRequest] = useState(() => new IdempotentRequest());

  const {
    mutate: finalize,
    isSuccess,
    ...finalizeMutation
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
  });

  useEffect(() => {
    if (ready) {
      const mnemonics = values
        .map((wallet) => wallet.mnemonic)
        .filter(isTruthy);
      // NOTE: Make sure "finalize" is idempotent
      finalize(mnemonics);
    }
  }, [finalize, ready, values]);

  const autoFocusRef = useRef<HTMLAnchorElement | null>(null);
  useEffect(() => {
    if (buttonFocusReady) {
      autoFocusRef.current?.focus();
    }
  }, [buttonFocusReady]);

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      <Header
        title={ready ? 'Wallet Created' : 'Generating...'}
        onBack={() => {}}
      />

      <div className="flex-1 p-4 relative flex flex-col items-center">
        <div className="absolute inset-0 pointer-events-none">
          <ImportBackground animate={!ready} />
        </div>

        <div className="flex-1 w-full z-10">
          <ImportDecoration
            wallets={values}
            isLoading={!values}
            loadingTitle="Importing wallets"
          />
        </div>

        {finalizeMutation.isError ? (
          <div className="text-sm text-destructive text-center">
            {getError(finalizeMutation.error).message}
          </div>
        ) : null}

        {ready && isSuccess && (
          <div className="mt-auto w-full space-y-4 z-10 animate-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold">Successfully Created!</h2>
              <p className="text-sm text-muted-foreground">
                Your new recovery phrase is securely encrypted and stored.
              </p>
            </div>

            <Button
              size="md"
              variant="primary"
              onClick={() =>
                navigate('/overview', {
                  state: { direction: 'back' },
                })
              }
            >
              View Wallets
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
