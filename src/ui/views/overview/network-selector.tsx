import { createChain } from '@/modules/networks/chain';
import { NetworkId } from '@/modules/networks/network-id';
import { getAddressType } from '@/shared/wallet/classifiers';
import { useAddressParams } from '@/ui/hooks/request/internal/useAddressParams';
import { useCurrentNetworkId } from '@/ui/hooks/request/internal/useCurrentNetworkId';
import { useNetworks } from '@/ui/hooks/request/internal/useNetworks';
import { Image } from '@/ui/ui-kit/image';
import { useCallback, useEffect, useMemo } from 'react';
import { IoChevronForward } from 'react-icons/io5';
import { useNavigate, useSearchParams } from 'react-router-dom';

import AllNetworksIcon from 'url:@/ui/assets/all-networks.png';
import SolanaIcon from 'url:@/ui/assets/ecosystem-solana.svg';

export function NetworkSelector() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { networks } = useNetworks();
  const { networkId: storedNetworkId } = useCurrentNetworkId();
  const { singleAddress: currentAddress } = useAddressParams();

  const ecosystem = currentAddress ? getAddressType(currentAddress) : 'evm';
  const isSolanaWallet = ecosystem === 'solana';

  const urlNetworkId = searchParams.get('network');
  const networkId = urlNetworkId || storedNetworkId || 'all';

  useEffect(() => {
    if (isSolanaWallet && searchParams.has('network')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('network');
      setSearchParams(newParams, { replace: true });
    }
  }, [isSolanaWallet, searchParams, setSearchParams]);

  const activeNetwork = useMemo(() => {
    if (!networks || networkId === 'all') return null;
    return networks.getByNetworkId(createChain(networkId));
  }, [networks, networkId]);

  const handleSelectNetwork = useCallback(() => {
    if (isSolanaWallet) return;

    const currentParams = new URLSearchParams(searchParams);
    currentParams.set('next', '/overview');
    navigate(`/select-network?${currentParams.toString()}`);
  }, [navigate, searchParams, isSolanaWallet]);

  const networkLabel = useMemo(() => {
    if (isSolanaWallet) return 'Solana';
    if (!activeNetwork || networkId === 'all') return 'All Networks';
    return activeNetwork.name;
  }, [activeNetwork, networkId, isSolanaWallet]);

  const networkIcon = useMemo(() => {
    if (isSolanaWallet) {
      return networks?.getByNetworkId(createChain(NetworkId.Solana))?.icon_url;
    }
    if (activeNetwork && networkId !== 'all') {
      return activeNetwork.icon_url;
    }
    return AllNetworksIcon;
  }, [isSolanaWallet, activeNetwork, networkId, networks]);

  return (
    <div
      onClick={handleSelectNetwork}
      className={`flex items-center justify-between px-2.5 py-1.5 bg-accent/50 hover:bg-accent rounded-full transition-colors ${
        isSolanaWallet ? 'cursor-default' : 'cursor-pointer'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <div className="w-[18px] h-[18px] shrink-0 flex items-center justify-center overflow-hidden rounded-full">
          <Image
            src={isSolanaWallet ? SolanaIcon : networkIcon || AllNetworksIcon}
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
