import { createChain } from '@/modules/networks/chain';
import { NetworkId } from '@/modules/networks/network-id';
import { getAddressType } from '@/shared/wallet/classifiers';
import { usePreferences } from '@/ui/features/preferences';
import { useNetworks } from '@/ui/hooks/request/internal/useNetworks';
import { useAddressParams as useWalletAddressParams } from '@/ui/hooks/request/internal/useWallet';
import { cn } from '@/ui/lib/utils';
import { Image } from '@/ui/ui-kit/image';
import { useCallback, useMemo } from 'react';
import { IoChevronForward } from 'react-icons/io5';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ALL_NETWORK_IMAGE =
  'https://pub-c00e8ea6219e4be79477cc4888b05ffe.r2.dev/all-networks.png';

function useNetworkSelector() {
  const [searchParams] = useSearchParams();
  const { networks } = useNetworks();
  const { singleAddress } = useWalletAddressParams();
  const { preferences } = usePreferences();

  const isSolanaWallet = useMemo(() => {
    if (!singleAddress) return false;
    try {
      return getAddressType(singleAddress) === 'solana';
    } catch {
      return false;
    }
  }, [singleAddress]);

  const isTestnetMode = Boolean(preferences?.testnetMode?.on);

  const networkId = searchParams.get('network') ?? 'all';
  const isAllNetworks = networkId === 'all';

  const activeNetwork = useMemo(() => {
    if (!networks || isAllNetworks) return null;
    return networks.getByNetworkId(createChain(networkId));
  }, [networks, networkId, isAllNetworks]);

  const solanaNetwork = useMemo(() => {
    if (!isSolanaWallet) return null;
    const targetId = isTestnetMode ? NetworkId.SolanaDevnet : NetworkId.Solana;
    return networks?.getByNetworkId(createChain(targetId)) ?? null;
  }, [isSolanaWallet, isTestnetMode, networks]);

  const networkLabel = useMemo(() => {
    if (activeNetwork) return activeNetwork.name;
    if (isSolanaWallet) {
      return (
        solanaNetwork?.name ?? (isTestnetMode ? 'Solana Devnet' : 'Solana')
      );
    }
    return 'All Networks';
  }, [activeNetwork, isSolanaWallet, solanaNetwork, isTestnetMode]);

  const networkIcon = useMemo(() => {
    if (activeNetwork) {
      return activeNetwork.icon_url;
    }
    if (isSolanaWallet) {
      return solanaNetwork?.icon_url ?? ALL_NETWORK_IMAGE;
    }
    return ALL_NETWORK_IMAGE;
  }, [activeNetwork, isSolanaWallet, solanaNetwork]);

  return { networkId, networkLabel, networkIcon, isSolanaWallet };
}

export function NetworkSelect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { networkId, networkLabel, networkIcon, isSolanaWallet } =
    useNetworkSelector();

  const handleSelectNetwork = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.set('next', '/overview');
    params.set('network', networkId);
    navigate(`/select-network?${params.toString()}`);
  }, [navigate, searchParams, networkId]);

  return (
    <div
      onClick={isSolanaWallet ? undefined : handleSelectNetwork}
      role="button"
      className={cn(
        'flex items-center justify-between px-2.5 py-2 bg-accent/50 rounded-full transition-colors',
        isSolanaWallet ? 'cursor-default' : 'cursor-pointer hover:bg-accent'
      )}
    >
      <div className="flex items-center gap-1.5">
        <div className="size-[18px] shrink-0 flex items-center justify-center overflow-hidden rounded-full">
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
