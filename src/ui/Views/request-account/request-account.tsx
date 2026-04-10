import type {
  DeviceAccount,
  ExternallyOwnedAccount,
} from '@/background/wallet/model/account-container';
import { Permission } from '@/background/wallet/model/types';
import { walletPort, windowPort } from '@/shared/channel';
import type { BareWallet } from '@/shared/types/bare-wallet';
import { WalletGroup } from '@/shared/types/wallet-group';
import type { BlockchainType } from '@/shared/wallet/classifiers';
import { BlockieImg } from '@/ui/components/BlockieImg';
import { DappSecurityCheck } from '@/ui/components/DappSecurityCheck/DappSecurityCheck';
import { Header } from '@/ui/components/header';
import { SiteFaviconImg } from '@/ui/components/SiteFaviconImg';
import { WalletList } from '@/ui/components/wallet-list/wallet-list';
import { usePhishingDefenceStatus } from '@/ui/hooks/request/external/usePhishingDefenceStatus';
import { useEvent } from '@/ui/hooks/useEvent';
import { truncateAddress } from '@/ui/lib/utils';
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerTrigger,
  Input,
  Sheet,
  SheetContent,
} from '@/ui/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { BsShieldFillCheck, BsShieldFillExclamation } from 'react-icons/bs';
import { FaLink, FaWallet } from 'react-icons/fa';
import { LuInfo } from 'react-icons/lu';
import { TiArrowSortedDown } from 'react-icons/ti';
import { useSearchParams } from 'react-router-dom';
import { invariant } from 'src/shared/invariant';
import { normalizeAddress } from 'src/shared/normalize-address';
import {
  assertKnownEcosystems,
  isMatchForEcosystem,
} from 'src/shared/wallet/shared';
import { getWalletId } from 'src/shared/wallet/wallet-list';
import { WalletDisplayName } from 'src/ui/components/WalletDisplayName';

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

const MIN_WALLETS_FOR_SEARCH = 5;

class NoWalletForEcosystemError extends Error {}

export function WalletSelect({
  value,
  ecosystem,
  walletGroups,
  onSelect,
}: {
  value: string;
  ecosystem: BlockchainType;
  walletGroups?: WalletGroup[] | null;
  onSelect(
    wallet: ExternallyOwnedAccount | BareWallet | DeviceAccount,
    groupId: string
  ): void;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const allAddresses = useMemo(
    () =>
      walletGroups?.flatMap((group) =>
        group.walletContainer.wallets.map((w) => w.address)
      ) || [],
    [walletGroups]
  );

  const totalWalletCount = allAddresses.length;

  const isWalletMatchingFilter = useCallback(
    (item: any) =>
      isMatchForEcosystem(item.address, ecosystem) &&
      (searchQuery === '' ||
        item.address.toLowerCase().includes(searchQuery.toLowerCase())),
    [ecosystem, searchQuery]
  );

  const showSearch = totalWalletCount >= MIN_WALLETS_FOR_SEARCH;

  if (!walletGroups?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <FaWallet className="w-12 h-12 mb-4 opacity-20" />
        <p>No wallets found for this ecosystem.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 pt-0 border-b border-muted-foreground/10">
        <Input
          type="search"
          placeholder="Search wallets"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          size="md"
          status="default"
          disabled={!showSearch}
        />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4">
        <WalletList
          selectedAddress={value || ''}
          walletGroups={walletGroups as any}
          onSelect={onSelect}
          predicate={isWalletMatchingFilter}
        />
      </div>
    </div>
  );
}

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
    useErrorBoundary: true,
    suspense: true,
    refetchOnWindowFocus: false,
    retry: false,
  });
}

function Account({
  selectedWallet,
  selectedWalletId,
  walletGroups,
  ecosystem,
  onWalletSelect,
}: {
  selectedWallet: ExternallyOwnedAccount;
  selectedWalletId: string;
  walletGroups?: WalletGroup[] | null;
  ecosystem: BlockchainType;
  onWalletSelect: (
    wallet: ExternallyOwnedAccount | BareWallet | DeviceAccount,
    groupId: string
  ) => void;
}) {
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setWalletDialogOpen(true)}
          className="group relative flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all border-muted-foreground/10 text-left w-full"
        >
          <div className="flex items-center gap-3">
            <div className="shrink-0 flex items-center justify-center">
              <BlockieImg
                address={selectedWallet.address}
                size={28}
                borderRadius={4}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-tight">
                <WalletDisplayName wallet={selectedWallet} />
              </span>
              <span className="text-[11px] font-mono text-muted-foreground/80">
                {truncateAddress(selectedWallet.address)}
              </span>
            </div>
          </div>
          <TiArrowSortedDown className="size-3.5 text-muted-foreground/80" />
        </button>
      </div>

      <Sheet open={walletDialogOpen} onOpenChange={setWalletDialogOpen}>
        <SheetContent className="gap-0">
          <Header
            title="Select Wallet"
            onBack={() => setWalletDialogOpen(false)}
          />
          <div className="flex-1 overflow-hidden">
            <WalletSelect
              value={selectedWalletId}
              walletGroups={walletGroups}
              ecosystem={ecosystem}
              onSelect={(w, gId) => {
                onWalletSelect(w, gId);
                setWalletDialogOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
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
          <p className="text-sm">Wants to connect to Youno</p>
          <LuInfo className="w-4 h-4" />
        </span>
      </DrawerTrigger>
      <DrawerContent variant="inset">
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
        <div className="w-16 h-16 rounded-xl bg-background flex items-center justify-center ring-1 ring-primary/20 shadow-sm overflow-hidden">
          <SiteFaviconImg
            size={64}
            url={origin}
            className="w-full h-full object-cover"
          />
        </div>
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
      <Button size="md" variant="outline" onClick={onCancel} className="flex-1">
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
  ecosystem,
  wallet,
  walletGroups,
  onConfirm,
  onReject,
}: {
  origin: string;
  ecosystem: BlockchainType;
  wallet: ExternallyOwnedAccount;
  walletGroups?: WalletGroup[] | null;
  onConfirm: (value: { address: string; origin: string }) => void;
  onReject: () => void;
}) {
  const [selectedWallet, setSelectedWallet] = useState(wallet);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const securityQuery = usePhishingDefenceStatus(origin);
  const isPhishing = securityQuery.data?.status === 'phishing';

  const selectedWalletId = useMemo(() => {
    if (!selectedWallet) return '';
    if (selectedGroupId) {
      return getWalletId({
        address: selectedWallet.address,
        groupId: selectedGroupId,
      });
    }
    return normalizeAddress(selectedWallet.address);
  }, [selectedWallet, selectedGroupId]);

  const handleWalletSelect = useCallback(
    (
      newWallet: ExternallyOwnedAccount | BareWallet | DeviceAccount,
      gId: string
    ) => {
      setSelectedWallet(newWallet as ExternallyOwnedAccount);
      setSelectedGroupId(gId);
    },
    []
  );

  const handleConnect = useCallback(() => {
    onConfirm({ address: selectedWallet.address, origin });
  }, [selectedWallet, origin, onConfirm]);

  return (
    <div className="relative flex flex-col h-screen overflow-hidden animate-fade-in bg-[#f6f6f8] dark:bg-[#1f1f1f]">
      <RequestAccountsHeader origin={origin} isPhishing={isPhishing} />

      <div className="flex flex-1 flex-col overflow-hidden rounded-t-3xl shadow-2xl bg-background outline-none">
        <div className="flex-1 p-4 space-y-4">
          <Account
            selectedWallet={selectedWallet}
            selectedWalletId={selectedWalletId}
            walletGroups={walletGroups}
            ecosystem={ecosystem}
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
          isConnectDisabled={!selectedWallet}
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

  assertKnownEcosystems([ecosystem]);
  invariant(origin, 'origin get-parameter is required');
  invariant(windowId, 'windowId get-parameter is required');

  const { data, isLoading, isError, error } = useQuery({
    retry: 1,
    queryKey: ['prepareRequestAccountsViewData', ecosystem],
    useErrorBoundary: false,
    queryFn: async () => {
      const currentWallet = await walletPort.request('uiGetCurrentWallet');
      const allWalletGroups = await walletPort.request('uiGetWalletGroups');
      const walletGroups = allWalletGroups?.filter((group) => {
        return group.walletContainer.wallets.some((wallet) =>
          isMatchForEcosystem(wallet.address, ecosystem)
        );
      });

      const currentAddress = currentWallet?.address;

      let wallet: typeof currentWallet = null;
      if (currentAddress && isMatchForEcosystem(currentAddress, ecosystem)) {
        wallet = currentWallet;
      } else {
        wallet =
          walletGroups
            ?.at(0)
            ?.walletContainer.wallets.find((wallet) =>
              isMatchForEcosystem(wallet.address, ecosystem)
            ) ?? null;
      }
      if (!wallet) {
        throw new NoWalletForEcosystemError(ecosystem);
      }
      return { wallet, walletGroups };
    },
  });

  const wallet = data?.wallet;
  const walletGroups = data?.walletGroups;

  const handleConfirm = useCallback(
    (result: { address: string; origin: string }) => {
      windowPort.confirm(windowId, result);
    },
    [windowId]
  );

  const handleReject = useCallback(() => {
    windowPort.reject(windowId);
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

  if (isLoading || !wallet) {
    return null;
  }

  return (
    <RequestAccountsView
      wallet={wallet}
      walletGroups={walletGroups}
      origin={origin}
      ecosystem={ecosystem}
      onConfirm={handleConfirm}
      onReject={handleReject}
    />
  );
}
