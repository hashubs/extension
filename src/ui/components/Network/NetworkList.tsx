import { useNetworks } from '@/ui/hooks/request/internal/useNetworks';
import { cn } from '@/ui/lib/utils';
import { CardItem } from '@/ui/ui-kit/card/item';
import { useMemo } from 'react';
import { IoCheckmark } from 'react-icons/io5';

import AllNetworksIcon from 'url:@/ui/assets/all-networks.png';

interface NetworkListProps {
  activeNetworkId: string;
  onSelect: (networkId: string) => void;
  searchQuery?: string;
}

export function NetworkList({
  activeNetworkId,
  onSelect,
  searchQuery = '',
}: NetworkListProps) {
  const { networks, isLoading } = useNetworks();

  const filteredNetworks = useMemo(() => {
    if (!networks) return [];
    const all = networks.getNetworks();

    const uniqueNetworksMap = new Map();
    all.forEach((n) => uniqueNetworksMap.set(n.id, n));
    const uniqueNetworks = Array.from(uniqueNetworksMap.values());

    if (!searchQuery) return uniqueNetworks;

    return uniqueNetworks.filter(
      (n) =>
        n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [networks, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 w-full bg-muted rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto no-scrollbar pb-6">
      {(!searchQuery || 'all networks'.includes(searchQuery.toLowerCase())) && (
        <CardItem
          item={{
            label: 'All Networks',
            subLabel: 'View assets across all chains',
            imgUrl: AllNetworksIcon,
            onClick: () => onSelect('all'),
            iconRight: activeNetworkId === 'all' ? IoCheckmark : undefined,
            iconRightClassName: 'text-green-500 rounded-none',
            className: cn(
              activeNetworkId === 'all' &&
                'bg-black/5 dark:bg-white/5 rounded-lg'
            ),
          }}
        />
      )}

      {filteredNetworks.map((network) => {
        const isActive = activeNetworkId === network.id;
        return (
          <CardItem
            key={network.id}
            item={{
              label: network.name,
              subLabel: network.is_testnet ? 'Testnet' : 'Mainnet',
              imgUrl: network.icon_url,
              onClick: () => onSelect(network.id),
              iconRight: isActive ? IoCheckmark : undefined,
              iconRightClassName: 'text-green-500 rounded-none',
              className: cn(
                isActive && 'bg-black/5 dark:bg-white/5 rounded-lg',
                'hover:rounded-lg'
              ),
            }}
          />
        );
      })}

      {filteredNetworks.length === 0 && searchQuery && (
        <div className="p-8 text-center text-muted-foreground italic">
          No networks found for "{searchQuery}"
        </div>
      )}
    </div>
  );
}
