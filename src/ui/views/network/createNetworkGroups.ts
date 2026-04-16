import { NetworkConfig } from '@/modules/networks/network-config';
import { NetworkId } from '@/modules/networks/network-id';
import { Networks } from '@/modules/networks/networks';
import { bringToFront } from 'src/shared/array-mutations';
import type { BlockchainType } from 'src/shared/wallet/classifiers';

type ListGroup<T> = {
  key: string;
  name: string | null;
  items: T[];
};

export type NetworkGroups = ListGroup<NetworkConfig>[];

function compareNetworks(a: NetworkConfig, b: NetworkConfig) {
  const aString = a.name.toString().toLowerCase();
  const bString = b.name.toString().toLowerCase();
  return aString < bString ? -1 : aString > bString ? 1 : 0;
}

export function createGroups({
  networks,
  externalChains = [],
  standard,
  testnetMode,
  filterPredicate = () => true,
}: {
  standard: BlockchainType | 'all';
  networks: Networks;
  externalChains?: NetworkConfig[];
  testnetMode: boolean;
  filterPredicate?: (network: NetworkConfig) => boolean;
}): NetworkGroups {
  const allInternalNetworks = networks
    .getDefaultNetworks(standard)
    .filter((item) => Boolean(item.is_testnet) === testnetMode)
    .filter(filterPredicate);

  const pinnedNetworkId =
    standard === 'evm' ? NetworkId.Zero : NetworkId.Solana;

  // Group 1: My Networks (Internal)
  const myNetworks = allInternalNetworks.sort(compareNetworks);

  const groups: NetworkGroups = [
    {
      key: 'added',
      name: 'My Networks',
      items: bringToFront(myNetworks, (item) => item.id === pinnedNetworkId),
    },
  ];

  // Group 2: Popular Networks (External / Explore)
  if (externalChains.length > 0) {
    groups.push({
      key: 'available',
      name: 'Explore Networks',
      items: externalChains.filter(filterPredicate),
    });
  }

  return groups;
}
