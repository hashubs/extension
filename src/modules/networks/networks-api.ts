import { normalizeChainId } from '../../shared/normalize-chain-id';
import type { NetworkConfig } from './network-config';
import { Networks } from './networks';
import { networksFallbackInfo } from './networks-fallback';

export async function getNetworks({
  ids,
  include_testnets,
  supported_only = false,
}: {
  ids: string[] | null;
  include_testnets: boolean;
  supported_only?: boolean;
}): Promise<NetworkConfig[]> {
  const filtered = networksFallbackInfo.filter((network) => {
    if (ids && !ids.includes(network.id)) return false;
    if (!include_testnets && network.is_testnet) return false;
    if (supported_only && !network.supports_actions) return false;
    return true;
  });

  return Promise.resolve(filtered);
}

export async function getNetworkByChainId(chainId: string) {
  const normalizedId = normalizeChainId(chainId);
  const network = networksFallbackInfo.find(
    (item) =>
      Networks.isEip155(item) && Networks.getChainId(item) === normalizedId
  );
  return network || null;
}

export async function getNetworksBySearch({
  query,
  includeTestnets,
}: {
  query: string;
  includeTestnets: boolean;
}) {
  const queryLower = query.toLowerCase().trim();
  const filtered = networksFallbackInfo.filter((network) => {
    if (!includeTestnets && network.is_testnet) return false;
    return (
      network.name.toLowerCase().includes(queryLower) ||
      network.id.toLowerCase().includes(queryLower) ||
      (Networks.isEip155(network) &&
        String(Networks.getChainId(network)).includes(queryLower))
    );
  });
  return Promise.resolve(filtered);
}
