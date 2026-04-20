import { Permission } from '@/background/wallet/model/types';
import { walletPort, windowPort } from '@/shared/channel';
import { focusNode } from '@/shared/focus-node';
import { ExternallyOwnedAccount } from '@/shared/types/externally-owned-account';
import type { BlockchainType } from '@/shared/wallet/classifiers';
import { BlockieAddress } from '@/ui/components/Blockie';
import { DappSecurityCheck } from '@/ui/components/DappSecurityCheck/DappSecurityCheck';
import { SiteFaviconImg } from '@/ui/components/SiteFaviconImg';
import { WalletDisplayName } from '@/ui/components/wallet';
import { usePhishingDefenceStatus } from '@/ui/hooks/request/internal/usePhishingDefenceStatus';
import { usePrefetchWalletGroups } from '@/ui/hooks/request/internal/useWalletGroups';
import { useEvent } from '@/ui/hooks/useEvent';
import { Button, Drawer, DrawerContent, DrawerTrigger } from '@/ui/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { BsShieldFillCheck, BsShieldFillExclamation } from 'react-icons/bs';
import { FaLink } from 'react-icons/fa';
import { LuInfo } from 'react-icons/lu';
import { TiArrowSortedDown } from 'react-icons/ti';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { invariant } from 'src/shared/invariant';
import { normalizeAddress } from 'src/shared/normalize-address';
import {
  assertKnownEcosystems,
  isMatchForEcosystem,
} from 'src/shared/wallet/shared';

const WALLET_RESTRICTIONS_LIST = [
  'Transfer or move your funds',
  'Sign transactions on your behalf',
  'Access your private key',
];

const PHISHING_RISK_LIST = [
  'Trick you into signing malicious transactions',
  'Steal your seed phrase or private key',
  'Drain your wallet without approval',
];

const ECOSYSTEM_ERROR_MESSAGES: Record<BlockchainType, string> = {
  solana:
    'You do not have Solana wallets to connect. Please close this window and visit Settings –> Manage Wallets to create a Solana wallet',
  evm: 'You do not have Ethereum wallets to connect. Please close this window and visit Settings –> Manage Wallets to create an Ethereum wallet',
};

class NoWalletForEcosystemError extends Error {}

function useCheckOriginPermissionAndRedirect({
  origin,
  address,
  onPermissionAlreadyGranted,
}: {
  origin: string;
  address: string | undefined;
  onPermissionAlreadyGranted: () => void;
}) {
  const handlePermissionCheckSuccess = useEvent(
    (result: Record<string, Permission>) => {
      if (!address) {
        return;
      }
      const normalizedAddress = normalizeAddress(address);
      const hasPermission =
        result[origin]?.addresses.includes(normalizedAddress);
      if (hasPermission) {
        onPermissionAlreadyGranted();
      }
    }
  );

  useQuery({
    queryKey: ['getOriginPermissions'],
    queryFn: async () => {
      const result = await walletPort.request('getOriginPermissions');
      handlePermissionCheckSuccess(result);
      return result;
    },
    enabled: Boolean(address),
    refetchOnWindowFocus: false,
    retry: false,
  });
}

function Account({
  selectedWallet,
  onWalletSelect,
}: {
  selectedWallet: ExternallyOwnedAccount;
  onWalletSelect: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onWalletSelect}
        className="group relative flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all border-muted-foreground/10 text-left w-full"
      >
        <div className="flex items-center gap-3">
          <div className="shrink-0 flex items-center justify-center">
            <BlockieAddress
              address={selectedWallet.address}
              size={28}
              borderRadius={4}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-tight">Wallet</span>
            <WalletDisplayName
              wallet={selectedWallet}
              className="text-[11px] font-mono text-muted-foreground/80"
            />
          </div>
        </div>
        <TiArrowSortedDown className="size-3.5 text-muted-foreground/80" />
      </button>
    </div>
  );
}

function Permissions({
  origin,
  isPhishing,
}: {
  origin: string;
  isPhishing: boolean;
}) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <span className="flex items-center gap-1 text-muted-foreground">
          <p className="text-sm">Wants to connect to Selvo</p>
          <LuInfo className="w-4 h-4" />
        </span>
      </DrawerTrigger>
      <DrawerContent
        variant="inset"
        title="Request Account"
        description="Request Account"
      >
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                <SiteFaviconImg
                  size={36}
                  url={origin}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium capitalize">
                  {new URL(origin).hostname.split('.')[0]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new URL(origin).hostname}
                </span>
              </div>
            </div>
            {isPhishing ? (
              <BsShieldFillExclamation className="size-6 text-red-600" />
            ) : (
              <BsShieldFillCheck className="size-6 text-teal-600" />
            )}
          </div>

          <div className="h-px bg-border" />

          {isPhishing ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                This site has been flagged as dangerous
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We strongly recommend{' '}
                <span className="font-semibold">not proceeding</span>. This site
                has been reported as a phishing attempt and may try to steal
                your sensitive information.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              This site will have{' '}
              <span className="text-foreground font-medium">
                read-only access
              </span>{' '}
              to your wallet address and balances. It cannot move your funds or
              sign transactions without your explicit approval.
            </p>
          )}

          <div className="space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
              {isPhishing ? 'Potential risks' : 'This site cannot'}
            </p>
            {(isPhishing ? PHISHING_RISK_LIST : WALLET_RESTRICTIONS_LIST).map(
              (text, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isPhishing ? 'bg-red-400/70' : 'bg-teal-400/70'
                    }`}
                  />
                  <span className="text-xs text-muted-foreground">{text}</span>
                </div>
              )
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function RequestAccountsHeader({
  origin,
  isPhishing,
}: {
  origin: string;
  isPhishing: boolean;
}) {
  return (
    <div className="shrink-0 pt-8 pb-4 px-6 flex flex-col items-center bg-[#f6f6f8] dark:bg-[#1f1f1f]">
      <div className="relative mb-4">
        <SiteFaviconImg size={64} url={origin} className="size-16" />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center ring-2 ring-[#1c1e22]">
          <FaLink className="w-2.5 h-2.5 text-white" />
        </div>
      </div>

      <h1 className="text-xl font-bold text-foreground mb-0.5">
        {new URL(origin).hostname}
      </h1>
      <Permissions origin={origin} isPhishing={isPhishing} />
    </div>
  );
}

function RequestAccountsFooter({
  onCancel,
  onConnect,
  isConnectDisabled,
}: {
  onCancel: () => void;
  onConnect: () => void;
  isConnectDisabled: boolean;
}) {
  return (
    <div className="flex shrink-0 gap-2 p-4 bg-background border-t border-foreground/5">
      <Button
        size="md"
        variant="outline"
        onClick={onCancel}
        className="flex-1"
        ref={focusNode}
      >
        Cancel
      </Button>
      <Button
        size="md"
        variant="primary"
        onClick={onConnect}
        disabled={isConnectDisabled}
        className="flex-2"
      >
        Connect
      </Button>
    </div>
  );
}

function RequestAccountsView({
  origin,
  wallet,
  onConfirm,
  onReject,
}: {
  origin: string;
  wallet: ExternallyOwnedAccount;
  onConfirm: (value: { address: string; origin: string }) => void;
  onReject: () => void;
}) {
  const securityQuery = usePhishingDefenceStatus(origin);
  const isPhishing = securityQuery.data?.status === 'phishing';
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const handleWalletSelect = useCallback(() => {
    const newParams = new URLSearchParams(params.toString());
    newParams.set('next', '/request-accounts');
    navigate(`/select-wallet?${newParams.toString()}`);
  }, [navigate, params]);

  const handleConnect = useCallback(() => {
    onConfirm({ address: wallet.address, origin });
  }, [wallet, origin, onConfirm]);

  return (
    <div className="relative flex flex-col h-full overflow-hidden animate-fade-in bg-[#f6f6f8] dark:bg-[#1f1f1f]">
      <RequestAccountsHeader origin={origin} isPhishing={isPhishing} />

      <div className="flex flex-1 flex-col overflow-hidden rounded-t-3xl shadow-2xl bg-background outline-none">
        <div className="flex-1 p-4 space-y-4">
          <Account
            selectedWallet={wallet}
            onWalletSelect={handleWalletSelect}
          />
          <DappSecurityCheck
            status={securityQuery.data?.status}
            isLoading={securityQuery.isLoading}
          />
        </div>

        <RequestAccountsFooter
          onCancel={onReject}
          onConnect={handleConnect}
          isConnectDisabled={!wallet}
        />
      </div>
    </div>
  );
}

export function RequestAccounts() {
  const [params] = useSearchParams();
  const origin = params.get('origin');
  const windowId = params.get('windowId');
  const ecosystem = (params.get('ecosystem') || 'evm') as BlockchainType;

  usePrefetchWalletGroups();

  assertKnownEcosystems([ecosystem]);
  invariant(origin, 'origin get-parameter is required');
  invariant(windowId, 'windowId get-parameter is required');

  const { data, isPending, isError, error } = useQuery({
    retry: 1,
    queryKey: [
      'prepareRequestAccountsViewData',
      ecosystem,
      params.get('selectedAddress'),
    ],
    queryFn: async () => {
      const selectedAddress = params.get('selectedAddress');
      const allWalletGroups = await walletPort.request('uiGetWalletGroups');
      const walletGroups = allWalletGroups?.filter((group) => {
        return group.walletContainer.wallets.some((wallet) =>
          isMatchForEcosystem(wallet.address, ecosystem)
        );
      });

      let wallet: ExternallyOwnedAccount | null = null;

      if (selectedAddress && allWalletGroups) {
        for (const group of allWalletGroups) {
          const found = group.walletContainer.wallets.find(
            (w) =>
              normalizeAddress(w.address) === normalizeAddress(selectedAddress)
          );
          if (found) {
            wallet = found as ExternallyOwnedAccount;
            break;
          }
        }
      }

      if (!wallet) {
        const currentWallet = await walletPort.request('uiGetCurrentWallet');
        const currentAddress = currentWallet?.address;

        if (currentAddress && isMatchForEcosystem(currentAddress, ecosystem)) {
          wallet = currentWallet;
        } else {
          wallet = (walletGroups
            ?.at(0)
            ?.walletContainer.wallets.find((wallet) =>
              isMatchForEcosystem(wallet.address, ecosystem)
            ) ?? null) as ExternallyOwnedAccount;
        }
      }

      if (!wallet) {
        throw new NoWalletForEcosystemError(ecosystem);
      }
      return { wallet, walletGroups };
    },
  });

  const wallet = data?.wallet;

  const handleConfirm = useCallback(
    async (result: { address: string; origin: string }) => {
      await windowPort.confirm(windowId, result);
    },
    [windowId]
  );

  const handleReject = useCallback(async () => {
    await windowPort.reject(windowId);
  }, [windowId]);

  useCheckOriginPermissionAndRedirect({
    origin,
    address: wallet?.address,
    onPermissionAlreadyGranted: () => {
      if (!wallet) {
        throw new Error('Wallet must be defined');
      }
      handleConfirm({ address: wallet.address, origin });
    },
  });

  if (isError) {
    if (error instanceof NoWalletForEcosystemError) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-6 text-center">
          <h2 className="text-xl font-bold">No wallets to connect</h2>
          <p className="text-sm text-gray-500">
            {ECOSYSTEM_ERROR_MESSAGES[ecosystem]}
          </p>
        </div>
      );
    } else {
      throw error;
    }
  }

  if (isPending || !wallet) {
    return null;
  }

  return (
    <RequestAccountsView
      wallet={wallet}
      origin={origin}
      onConfirm={handleConfirm}
      onReject={handleReject}
    />
  );
}
