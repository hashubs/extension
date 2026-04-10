import { normalizeChainId } from '@/shared/normalize-chain-id';

const CUSTOM_NETWORK_PREFIX = 'youno-custom-network-';

export function toCustomNetworkId(chainId: string) {
  return `${CUSTOM_NETWORK_PREFIX}${normalizeChainId(chainId)}`;
}

export function isCustomNetworkId(networkId: string) {
  return networkId.startsWith(CUSTOM_NETWORK_PREFIX);
}
