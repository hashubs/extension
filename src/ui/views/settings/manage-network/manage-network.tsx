import { isCustomNetworkId } from '@/modules/ethereum/chains/helpers';
import { getOriginUrlFromMetaData } from '@/modules/networks/helpers';
import { NetworkConfig } from '@/modules/networks/network-config';
import { NetworkConfigMetaData, Networks } from '@/modules/networks/networks';
import { intersperce } from '@/shared/intersperce';
import { getAddressType } from '@/shared/wallet/classifiers';
import { Layout } from '@/ui/components/layout';
import { usePreferences } from '@/ui/features/preferences';
import { useNetworks } from '@/ui/hooks/request/internal/useNetworks';
import { useAddressParams } from '@/ui/hooks/request/internal/useWallet';
import { Card, CardItem } from '@/ui/ui-kit/card';
import React, { useMemo } from 'react';
import { IoAddOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

const compareNetworks = (a: any, b: any) => {
  const aString = a.name.toString().toLowerCase();
  const bString = b.name.toString().toLowerCase();
  return aString < bString ? -1 : aString > bString ? 1 : 0;
};

function NetworkCaption({
  metadataRecord,
  network,
}: {
  metadataRecord: Record<string, NetworkConfigMetaData | undefined>;
  network: NetworkConfig;
}) {
  const metadata = metadataRecord[network.id];
  const originUrl = useMemo(() => {
    return metadata ? getOriginUrlFromMetaData(metadata) : null;
  }, [metadata]);

  if (!network.id || !metadata) {
    return null;
  }

  const { created, updated } = metadata;
  const createdFormatted = new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(created);
  const updatedFormatted = new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(updated);

  return (
    <caption className="text-muted-foreground/50">
      {intersperce(
        [
          originUrl ? (
            <span key={0}>
              {isCustomNetworkId(network.id) ? 'Added' : 'Set'} by{' '}
              <span style={{ color: 'var(--teal-500)' }}>{originUrl}</span>
            </span>
          ) : created && created === updated ? (
            <span key={0} title={createdFormatted}>
              {isCustomNetworkId(network.id) ? 'Created' : 'Saved'}{' '}
              {createdFormatted}
            </span>
          ) : null,
          updated && updated !== created ? (
            <span key={1} title={updatedFormatted}>
              Edited {updatedFormatted}
            </span>
          ) : null,
        ],
        (key) => (
          <span key={key}> · </span>
        )
      )}
    </caption>
  );
}

const NetworkRow = React.memo(
  ({
    networks,
    item,
    onClick,
  }: {
    networks: Networks | null;
    item: NetworkConfig;
    onClick: () => void;
  }) => {
    const metadataRecord = useMemo(
      () => networks?.getNetworksMetaData(),
      [networks]
    );

    return (
      <CardItem
        key={item.id}
        item={{
          imgUrl: item.icon_url,
          label: item.name,
          subLabelElement: (
            <NetworkCaption
              metadataRecord={metadataRecord || {}}
              network={item}
            />
          ),
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
  const addressType = useMemo(
    () => (singleAddress ? getAddressType(singleAddress) : null),
    [singleAddress]
  );

  const groups = useMemo(() => {
    if (!networks || !addressType) return [];

    const allInternal = networks
      .getNetworks()
      .filter((n) => Boolean(n.is_testnet) === isTestnetMode);

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

  return (
    <Layout
      title="Network"
      onBack={() => navigate('/settings', { state: { direction: 'back' } })}
    >
      <div className="space-y-4">
        <Card>
          <CardItem
            item={{
              icon: IoAddOutline,
              iconRight: IoChevronForwardOutline,
              label: 'Add Network',
              onClick: () => navigate('/settings/manage-networks/add'),
              iconClassName:
                'bg-linear-to-br from-indigo-500/20 to-indigo-600/10 text-indigo-400 border border-indigo-500/10',
            }}
          />
        </Card>
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
                    networks={networks}
                    onClick={() =>
                      navigate(`/settings/manage-networks/${item.id}`)
                    }
                  />
                ))}
              </Card>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
