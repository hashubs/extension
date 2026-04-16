import type { AddEthereumChainParameter } from '../ethereum/types/add-ethereum-chain-parameter';
import type { NetworkConfig } from './network-config';

export function injectChainConfig(
  networkConfig: NetworkConfig,
  chainConfig: AddEthereumChainParameter | null
): NetworkConfig {
  if (!chainConfig) {
    return networkConfig;
  }
  return {
    ...networkConfig,
    name: chainConfig.chainName,
    explorer_home_url:
      chainConfig.blockExplorerUrls?.[0] ||
      networkConfig.explorer_home_url ||
      null,
    explorer_address_url:
      networkConfig.explorer_address_url ||
      (chainConfig.blockExplorerUrls?.[0]
        ? `${chainConfig.blockExplorerUrls[0].replace(/\/$/, '')}/address/{ADDRESS}`
        : null),
    explorer_tx_url:
      networkConfig.explorer_tx_url ||
      (chainConfig.blockExplorerUrls?.[0]
        ? `${chainConfig.blockExplorerUrls[0].replace(/\/$/, '')}/tx/{HASH}`
        : null),
    explorer_token_url:
      networkConfig.explorer_token_url ||
      (chainConfig.blockExplorerUrls?.[0]
        ? `${chainConfig.blockExplorerUrls[0].replace(/\/$/, '')}/token/{ADDRESS}`
        : null),
    icon_url: chainConfig.iconUrls?.[0] || networkConfig.icon_url || '',
    rpc_url_public: chainConfig.rpcUrls,
    rpc_url_user: chainConfig.rpcUrls[0],
    native_asset: {
      name: chainConfig.nativeCurrency?.name,
      address: networkConfig.native_asset?.address || null,
      decimals: chainConfig.nativeCurrency.decimals,
      symbol: chainConfig.nativeCurrency.symbol,
      icon_url: null,
      id:
        networkConfig.native_asset?.id ||
        chainConfig.nativeCurrency.symbol.toLowerCase(),
    },
    hidden: chainConfig.hidden ?? networkConfig.hidden,
    is_testnet: chainConfig.is_testnet ?? networkConfig.is_testnet,
  };
}
