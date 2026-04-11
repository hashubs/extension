import type {
  DeviceAccount,
  ExternallyOwnedAccount,
} from '@/background/wallet/model/account-container';
import { walletPort } from '@/shared/channel';
import type { BareWallet } from '@/shared/types/bare-wallet';
import type { BlockchainType } from '@/shared/wallet/classifiers';
import { setCurrentAddress } from '@/shared/youno-api/internal/setCurrentAddress';
import { WalletList } from '@/ui/components/wallet/wallet-list/wallet-list';
import { Input } from '@/ui/ui-kit';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isMatchForEcosystem } from 'src/shared/wallet/shared';
import { Header } from '../header';

const MIN_WALLETS_FOR_SEARCH = 5;

export function WalletSelect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const ecosystem = searchParams.get('ecosystem') as BlockchainType;

  const { data: walletGroups } = useQuery({
    queryKey: ['wallet/uiGetWalletGroups'],
    queryFn: () => walletPort.request('uiGetWalletGroups'),
    suspense: false,
    useErrorBoundary: true,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { mutateAsync: updateCurrentAddress } = useMutation({
    mutationFn: (address: string) => setCurrentAddress({ address }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['wallet/uiGetCurrentWallet'],
      });
      queryClient.invalidateQueries({
        queryKey: ['wallet/getCurrentAddress'],
      });
    },
  });

  const onSelect = useCallback(
    async (wallet: ExternallyOwnedAccount | BareWallet | DeviceAccount) => {
      const next = searchParams.get('next');
      if (next) {
        // Used in RequestAccounts context, return value via query params
        const newParams = new URLSearchParams(searchParams);
        newParams.set('selectedAddress', wallet.address);
        newParams.delete('next');
        navigate(`${next}?${newParams.toString()}`, { replace: true });
      } else {
        // Used in normal app context, update global current address
        await updateCurrentAddress(wallet.address);
        navigate(-1);
      }
    },
    [navigate, searchParams, updateCurrentAddress]
  );

  const value = searchParams.get('selectedAddress') || '';

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
      (!ecosystem || isMatchForEcosystem(item.address, ecosystem)) &&
      (searchQuery === '' ||
        item.address.toLowerCase().includes(searchQuery.toLowerCase())),
    [ecosystem, searchQuery]
  );

  const showSearch = totalWalletCount >= MIN_WALLETS_FOR_SEARCH;

  if (!walletGroups?.length) {
    return null;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <Header title="Select Wallet" onBack={() => navigate(-1)} />

      <div className="px-4 pb-3 border-b border-muted-foreground/10">
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
