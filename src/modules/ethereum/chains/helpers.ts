import { EXTENSION } from '@/app/constants';
import { normalizeChainId } from '@/shared/normalize-chain-id';

const CUSTOM_NETWORK_PREFIX = `${EXTENSION.slug}-custom-network-`;

export function toCustomNetworkId(chainId: string) {
  return `${CUSTOM_NETWORK_PREFIX}${normalizeChainId(chainId)}`;
}

export function isCustomNetworkId(networkId: string) {
  return networkId.startsWith(CUSTOM_NETWORK_PREFIX);
}
