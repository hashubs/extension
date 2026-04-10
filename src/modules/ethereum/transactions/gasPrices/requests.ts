import { createChain } from '@/modules/networks/chain';
import type { NetworkConfig } from '@/modules/networks/network-config';
import { Networks } from '@/modules/networks/networks';
import { sendRpcRequest } from '@/shared/custom-rpc/rpc-request';
import type { YounoApiClient } from '@/shared/youno-api/youno-api-bare';
import type { ChainGasPrice } from './types';

export async function fetchGasPriceFromNode(
  network: NetworkConfig
): Promise<ChainGasPrice> {
  const url = Networks.getNetworkRpcUrlInternal(network);
  if (!url) {
    throw new Error(`RPC URL is missing from network config for ${network.id}`);
  }

  const { result } = await sendRpcRequest<string>(url, {
    method: 'eth_gasPrice',
    params: null,
  });
  const gasPrice = Number(result);
  return {
    average: {
      classic: gasPrice,
      eip1559: null,
      optimistic: null,
      eta: null,
    },
    fast: {
      classic: gasPrice,
      eip1559: null,
      optimistic: null,
      eta: null,
    },
  };
}

export async function fetchGasPrice({
  network,
  source,
  apiClient,
}: {
  network: NetworkConfig;
  source: 'testnet' | 'mainnet';
  apiClient: YounoApiClient;
}) {
  try {
    const response = await apiClient.getGasPrices(
      { chain: createChain(network.id) },
      { source }
    );
    const chainGasPrices = response.data;
    if (chainGasPrices) {
      return chainGasPrices;
    } else {
      throw new Error('unable to get gas prices from api');
    }
  } catch {
    return fetchGasPriceFromNode(network);
  }
}
