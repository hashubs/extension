import React, { useMemo } from 'react';
import { IoCheckmark } from 'react-icons/io5';

import { isCustomNetworkId } from '@/modules/ethereum/chains/helpers';
import { getOriginUrlFromMetaData } from '@/modules/networks/helpers';
import { NetworkConfigMetaData, Networks } from '@/modules/networks/networks';
import { getChainLogo } from '@/shared/chains/chain-logos';
import { BlockchainType, getAddressType } from '@/shared/wallet/classifiers';
import { usePreferences } from '@/ui/features/preferences';
import { useAddressParams } from '@/ui/hooks/request/internal/useAddressParams';
import { useNetworks } from '@/ui/hooks/request/internal/useNetworks';
import { cn } from '@/ui/lib/utils';
import { Card, CardItem } from '@/ui/ui-kit/card';

import { NetworkConfig } from '@/modules/networks/network-config';
import AllNetworksIcon from 'url:@/ui/assets/all-networks.png';

const compareNetworks = (a: any, b: any) => {
  const aString = a.name.toString().toLowerCase();
  const bString = b.name.toString().toLowerCase();
  return aString < bString ? -1 : aString > bString ? 1 : 0;
};

const NetworkRow = React.memo(
  ({
    item,
    activeNetworkId,
    isTestnetMode,
    metadata,
    groupKey,
    dateFormatter,
    onSelect,
  }: {
    item: NetworkConfig;
    activeNetworkId: string;
    isTestnetMode: boolean;
    metadata?: NetworkConfigMetaData;
    groupKey: string;
    dateFormatter: Intl.DateTimeFormat;
    onSelect: (id: string) => void;
  }) => {
    const caip = `${item.standard}:${item.specification.eip155?.id}`;
    const logoUrl = groupKey === 'other' ? getChainLogo(caip) : item.icon_url;
    const isActive = activeNetworkId === item.id;

    let subLabel =
      item.native_asset?.symbol || (isTestnetMode ? 'Testnet' : 'Mainnet');

    if (groupKey === 'other' && metadata) {
      const { created, updated } = metadata;
      const originUrl = getOriginUrlFromMetaData(metadata);
      const parts: string[] = [];

      if (originUrl) {
        parts.push(`Added by ${originUrl}`);
      }

      const createdStr = dateFormatter.format(created);
      if (!updated || updated === created) {
        parts.push(`Created ${createdStr}`);
      } else {
        parts.push(`Edited ${dateFormatter.format(updated)}`);
      }

      subLabel = parts.join(' • ');
    }

    return (
      <CardItem
        key={item.id}
        item={{
          label: item.name,
          subLabel,
          imgUrl: logoUrl,
          onClick: () => onSelect(item.id),
          iconRight: isActive ? IoCheckmark : undefined,
          iconRightClassName: 'text-green-500 hover:text-green-500',
          className: cn(
            'border-border',
            isActive && 'bg-black/5 dark:bg-white/5'
          ),
        }}
      />
    );
  }
);

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

  const { preferences } = usePreferences();
  const isTestnetMode = Boolean(preferences?.testnetMode?.on);

  const { singleAddress } = useAddressParams();
  const addressType = useMemo(
    () => (singleAddress ? getAddressType(singleAddress) : null),
    [singleAddress]
  );

  const groups = useMemo(() => {
    if (!networks || !addressType) return [];

    const all = networks
      .getNetworks()
      .filter(
        (n) =>
          Boolean(n.is_testnet) === isTestnetMode &&
          !n.hidden &&
          Networks.predicate(addressType as BlockchainType, n)
      );

    const uniqueNetworksMap = new Map();
    all.forEach((n) => uniqueNetworksMap.set(n.id, n));
    const uniqueNetworks = Array.from(uniqueNetworksMap.values());

    const filtered = !searchQuery
      ? uniqueNetworks
      : uniqueNetworks.filter(
          (n) =>
            n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.id.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const custom = filtered
      .filter((n) => isCustomNetworkId(n.id))
      .sort(compareNetworks);

    const defaults = filtered
      .filter((n) => !isCustomNetworkId(n.id))
      .sort(compareNetworks);

    return [
      {
        key: 'default',
        items: defaults,
      },
      {
        key: 'other',
        name: 'Other Networks',
        items: custom,
      },
    ].filter((g) => g.items.length > 0);
  }, [networks, searchQuery, isTestnetMode, addressType]);

  const metadataRecord = useMemo(
    () => networks?.getNetworksMetaData() || {},
    [networks]
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      }),
    []
  );

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
    <div className="flex flex-col overflow-y-auto no-scrollbar pb-6 gap-4">
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
              'rounded-lg hover:rounded-lg',
              activeNetworkId === 'all' && 'bg-black/5 dark:bg-white/5'
            ),
          }}
        />
      )}

      {groups.map((group) => (
        <div key={group.key} className="space-y-2">
          {group.name && (
            <h3 className="px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {group.name}
            </h3>
          )}
          <Card className="border border-border">
            {group.items.map((network) => (
              <NetworkRow
                key={network.id}
                item={network}
                activeNetworkId={activeNetworkId}
                isTestnetMode={isTestnetMode}
                metadata={metadataRecord[network.id]}
                groupKey={group.key}
                dateFormatter={dateFormatter}
                onSelect={onSelect}
              />
            ))}
          </Card>
        </div>
      ))}

      {groups.length === 0 && searchQuery && (
        <div className="p-8 text-center text-muted-foreground italic">
          No networks found for "{searchQuery}"
        </div>
      )}
    </div>
  );
}
