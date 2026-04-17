import { isCustomNetworkId } from '@/modules/ethereum/chains/helpers';
import { getOriginUrlFromMetaData } from '@/modules/networks/helpers';
import { NetworkConfig } from '@/modules/networks/network-config';
import { NetworkConfigMetaData } from '@/modules/networks/networks';
import { isSolanaAddress } from '@/modules/solana/shared';
import { getChainLogo } from '@/shared/chains/chain-logos';
import { getAddressType } from '@/shared/wallet/classifiers';
import { Header } from '@/ui/components/header';
import { usePreferences } from '@/ui/features/preferences';
import { useAddressParams } from '@/ui/hooks/request/internal/useAddressParams';
import { useNetworks } from '@/ui/hooks/request/internal/useNetworks';
import { Card, CardItem } from '@/ui/ui-kit/card';
import React, { useMemo } from 'react';
import { IoAddOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

const compareNetworks = (a: any, b: any) => {
  const aString = a.name.toString().toLowerCase();
  const bString = b.name.toString().toLowerCase();
  return aString < bString ? -1 : aString > bString ? 1 : 0;
};

const NetworkRow = React.memo(
  ({
    item,
    isTestnetMode,
    metadata,
    groupKey,
    dateFormatter,
    onClick,
  }: {
    item: NetworkConfig;
    isTestnetMode: boolean;
    metadata?: NetworkConfigMetaData;
    groupKey: string;
    dateFormatter: Intl.DateTimeFormat;
    onClick: () => void;
  }) => {
    const caip = `${item.standard}:${item.specification.eip155?.id}`;
    const logoUrl = groupKey === 'other' ? getChainLogo(caip) : item.icon_url;

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
          imgUrl: logoUrl,
          label: item.name,
          subLabel,
          iconRight: IoChevronForwardOutline,
          onClick,
          className: 'border-border',
        }}
      />
    );
  }
);

export function ManageNetwork() {
  const navigate = useNavigate();
  const { preferences } = usePreferences();
  const { networks } = useNetworks();

  const isTestnetMode = Boolean(preferences?.testnetMode?.on);

  const { singleAddress } = useAddressParams();
  const isSolana = isSolanaAddress(singleAddress);
  const addressType = useMemo(
    () => (singleAddress ? getAddressType(singleAddress) : null),
    [singleAddress]
  );

  const groups = useMemo(() => {
    if (!networks || !addressType) return [];

    const allInternal = networks
      .getNetworks()
      .filter((n) => Boolean(n.is_testnet) === isTestnetMode);

    console.log('[LOG MANAGE NETWORK] allInternal', allInternal);

    const custom = allInternal
      .filter((n) => isCustomNetworkId(n.id))
      .sort(compareNetworks);

    const defaults = allInternal
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
  }, [networks, isTestnetMode, addressType]);

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

  return (
    <div className="flex flex-col h-full no-scrollbar">
      <Header
        title="Network"
        onBack={() => navigate('/settings', { state: { direction: 'back' } })}
      />

      <div className="flex-1 p-4 pt-0 space-y-4 no-scrollbar overflow-y-auto">
        {!isSolana && (
          <Card>
            <CardItem
              item={{
                icon: IoAddOutline,
                iconRight: IoChevronForwardOutline,
                label: 'Add Network',
                onClick: () => navigate('/networks/add'),
                iconClassName:
                  'bg-linear-to-br from-indigo-500/20 to-indigo-600/10 text-indigo-400 border border-indigo-500/10',
              }}
            />
          </Card>
        )}

        <div className="space-y-4">
          {groups.map((group) => {
            return (
              <div key={group.key}>
                {group.name && (
                  <h3 className="px-1 text-xs font-bold uppercase tracking-widest text-muted-foreground/80 pb-2">
                    {group.name}
                  </h3>
                )}
                <Card className="border border-border">
                  {group.items.map((item) => (
                    <NetworkRow
                      key={item.id}
                      item={item}
                      isTestnetMode={isTestnetMode}
                      metadata={metadataRecord[item.id]}
                      groupKey={group.key}
                      dateFormatter={dateFormatter}
                      onClick={() => navigate(`/networks/${item.id}`)}
                    />
                  ))}
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
