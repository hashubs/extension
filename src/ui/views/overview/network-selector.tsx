import { createChain } from '@/modules/networks/chain';
import { NetworkId } from '@/modules/networks/network-id';
import { Networks } from '@/modules/networks/networks';
import { getChainLogo } from '@/shared/chains/chain-logos';
import { setCurrentNetworkId } from '@/shared/request/internal/setCurrentNetworkId';
import { BlockchainType, getAddressType } from '@/shared/wallet/classifiers';
import { usePreferences } from '@/ui/features/preferences';
import { useAddressParams as useWalletAddressParams } from '@/ui/hooks/request/internal/useAddressParams';
import { useCurrentNetworkId } from '@/ui/hooks/request/internal/useCurrentNetworkId';
import { useNetworks } from '@/ui/hooks/request/internal/useNetworks';
import { cn } from '@/ui/lib/utils';
import { Image } from '@/ui/ui-kit/image';
import { useCallback, useEffect, useMemo } from 'react';
import { IoChevronForward } from 'react-icons/io5';
import { useNavigate, useSearchParams } from 'react-router-dom';

import AllNetworksIcon from 'url:@/ui/assets/all-networks.png';

export function NetworkSelector() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { networks } = useNetworks();
  const { networkId: storedNetworkId } = useCurrentNetworkId();
  const { singleAddress: currentAddress } = useWalletAddressParams();

  const ecosystem = currentAddress ? getAddressType(currentAddress) : 'evm';
  const isSolanaWallet = ecosystem === 'solana';

  const { preferences } = usePreferences();
  const isTestnetMode = Boolean(preferences?.testnetMode?.on);

  const urlNetworkId = searchParams.get('network');
  const networkId = urlNetworkId || storedNetworkId || 'all';

  const activeNetwork = useMemo(() => {
    if (!networks || networkId === 'all') return null;
    return networks.getByNetworkId(createChain(networkId));
  }, [networks, networkId]);

  useEffect(() => {
    const isModeMismatch =
      activeNetwork && Boolean(activeNetwork.is_testnet) !== isTestnetMode;

    const isEcosystemMismatch =
      activeNetwork &&
      !Networks.predicate(ecosystem as BlockchainType, activeNetwork);

    if (isModeMismatch || isEcosystemMismatch) {
      setCurrentNetworkId({ networkId: null });

      if (searchParams.has('network')) {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('network');
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [activeNetwork, isTestnetMode, ecosystem, searchParams, setSearchParams]);

  const handleSelectNetwork = useCallback(() => {
    const currentParams = new URLSearchParams(searchParams);
    currentParams.set('next', '/overview');
    navigate(`/select-network?${currentParams.toString()}`);
  }, [navigate, searchParams]);

  const networkLabel = useMemo(() => {
    if (!activeNetwork || networkId === 'all') {
      if (isSolanaWallet) {
        const targetId = isTestnetMode
          ? NetworkId.SolanaDevnet
          : NetworkId.Solana;
        const solanaNet = networks?.getByNetworkId(createChain(targetId));
        return solanaNet?.name || (isTestnetMode ? 'Solana Devnet' : 'Solana');
      }
      return 'All Networks';
    }
    return activeNetwork.name;
  }, [activeNetwork, networkId, isSolanaWallet, networks, isTestnetMode]);

  const networkIcon = useMemo(() => {
    if (activeNetwork && networkId !== 'all') {
      console.log('[LOG NETWORK SELECTOR] activeNetwork', activeNetwork);
      const caip = `${activeNetwork.standard}:${activeNetwork.specification.eip155?.id}`;
      const logo = activeNetwork.icon_url || getChainLogo(caip);
      return logo;
    }
    if (isSolanaWallet) {
      const targetId = isTestnetMode
        ? NetworkId.SolanaDevnet
        : NetworkId.Solana;
      const solanaNet = networks?.getByNetworkId(createChain(targetId));
      console.log('[LOG NETWORK SELECTOR] solanaNet', solanaNet);
      return solanaNet?.icon_url || AllNetworksIcon;
    }
    return AllNetworksIcon;
  }, [activeNetwork, networkId, isSolanaWallet, networks, isTestnetMode]);

  return (
    <div
      onClick={isSolanaWallet ? undefined : handleSelectNetwork}
      role="button"
      className={cn(
        'flex items-center justify-between px-2.5 py-1.5 bg-accent/50 rounded-full transition-colors',
        isSolanaWallet ? 'cursor-default' : 'cursor-pointer hover:bg-accent'
      )}
    >
      <div className="flex items-center gap-1.5">
        <div className="w-[18px] h-[18px] shrink-0 flex items-center justify-center overflow-hidden rounded-full">
          <Image
            key={networkIcon}
            src={networkIcon}
            className="w-full h-full"
            alt={networkLabel}
          />
        </div>
        <span className="text-sm font-medium">{networkLabel}</span>
      </div>
      {!isSolanaWallet && (
        <IoChevronForward size={14} className="text-muted-foreground" />
      )}
    </div>
  );
}
