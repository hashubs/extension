import { accountPublicRPCPort, walletPort } from '@/shared/channel';
import { IdempotentRequest } from '@/shared/IdempotentRequest';
import { invariant } from '@/shared/invariant';
import { setCurrentAddress } from '@/shared/request/internal/setCurrentAddress';
import { assertKnownEcosystems } from '@/shared/wallet/shared';
import { Header } from '@/ui/components/header';
import { WithPasswordSession } from '@/ui/components/verify-user/WithPasswordSession';
import {
  useWalletGroups,
  WALLET_GROUPS_QUERY_KEY,
} from '@/ui/hooks/request/internal/useWalletGroups';
import { Button } from '@/ui/ui-kit';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ImportBackground, ImportDecoration } from './components';
import { queryClient } from '@/shared/query-client/queryClient';

function GenerateWalletContent() {
  const navigate = useNavigate();
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
      queryClient.invalidateQueries({ queryKey: WALLET_GROUPS_QUERY_KEY });
    },
  });

  useEffect(() => {
    if (status === 'idle') {
      // This is invoked twice in StrictMode, it's fine
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
      // NOTE: Make sure "finalize" is idempotent
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

  const handleBack = () => {
    if (isReady) {
      navigate('/settings/manage-wallets', {
        state: { direction: 'back' },
      });
    } else {
      navigate('/settings/manage-wallets/add', {
        state: { direction: 'back' },
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      <Header
        title={isReady ? 'Wallet Created' : 'Generating...'}
        onBack={handleBack}
      />
      <div className="flex-1 p-4 relative flex flex-col items-center">
        <div className="absolute inset-0 pointer-events-none">
          <ImportBackground animate={isLoading} />
        </div>

        <div className="flex-1 w-full z-10">
          <ImportDecoration
            wallets={generatedWallets || []}
            isLoading={isLoading}
            loadingTitle="Creating secure phrase..."
          />
        </div>

        {isReady && (
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

export function GenerateWalletView() {
  return (
    <WithPasswordSession
      text="Your password is required to securely access your recovery phrase."
      buttonTitle="Continue"
    >
      <GenerateWalletContent />
    </WithPasswordSession>
  );
}
