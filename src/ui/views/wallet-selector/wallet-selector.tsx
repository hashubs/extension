import { queryClient } from '@/shared/query-client/queryClient';
import { setCurrentAddress } from '@/shared/request/internal/setCurrentAddress';
import type { BareWallet } from '@/shared/types/bare-wallet';
import { DeviceAccount } from '@/shared/types/device';
import { ExternallyOwnedAccount } from '@/shared/types/externally-owned-account';
import type { BlockchainType } from '@/shared/wallet/classifiers';
import { Layout } from '@/ui/components/layout';
import { WalletList } from '@/ui/components/wallet/wallet-list/wallet-list';
import {
  QUERY_WALLET,
  useAddressParams,
  useWalletGroups,
} from '@/ui/hooks/request/internal/useWallet';
import { Input } from '@/ui/ui-kit';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isMatchForEcosystem } from 'src/shared/wallet/shared';

const MIN_WALLETS_FOR_SEARCH = 5;

export function WalletSelectorView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const ecosystem = searchParams.get('ecosystem') as BlockchainType;

  const { data: walletGroups } = useWalletGroups();
  const { singleAddress: currentAddress } = useAddressParams();

  const [searchQuery, setSearchQuery] = useState('');

  const { mutateAsync: updateCurrentAddress } = useMutation({
    mutationFn: (address: string) => setCurrentAddress({ address }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_WALLET.currentWallet,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_WALLET.currentAddress,
      });
    },
  });

  const onSelect = useCallback(
    async (wallet: ExternallyOwnedAccount | BareWallet | DeviceAccount) => {
      const next = searchParams.get('next');
      if (next) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('selectedAddress', wallet.address);
        newParams.delete('next');
        navigate(`${next}?${newParams.toString()}`, {
          replace: true,
          state: { direction: 'back' },
        });
      } else {
        await updateCurrentAddress(wallet.address);
        navigate(-1);
      }
    },
    [navigate, searchParams, updateCurrentAddress]
  );

  const handleBack = useCallback(() => {
    const next = searchParams.get('next');
    if (next) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('next');
      const target = `${next}${
        newParams.toString() ? `?${newParams.toString()}` : ''
      }`;
      navigate(target, {
        replace: true,
        state: { direction: 'back' },
      });
    } else {
      navigate('/overview', { state: { direction: 'back' } });
    }
  }, [navigate, searchParams]);

  const activeAddress =
    searchParams.get('selectedAddress') || currentAddress || '';

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

  return (
    <Layout title="Select Wallet" onBack={handleBack} wrapped={false}>
      <Input
        type="search"
        placeholder="Search wallets"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        size="md"
        status="default"
        icon={IoSearchOutline}
        disabled={!showSearch}
      />

      <WalletList
        selectedAddress={activeAddress}
        walletGroups={walletGroups as any}
        onSelect={onSelect}
        predicate={isWalletMatchingFilter}
      />
    </Layout>
  );
}
