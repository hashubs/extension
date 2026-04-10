import { getNetworksStore } from '@/modules/networks/networks-store.client';
import memoize from 'lodash/memoize';
import type { ChainId } from '../chainId';
import { getTransactionCount } from '../getTransactionCount';
import { estimateNetworkFee } from './estimateNetworkFee';

const fetchNonce = memoize(async (address: string, chainId: ChainId) => {
  const networksStore = await getNetworksStore();
  const network = await networksStore.fetchNetworkByChainId(chainId);
  const { value } = await getTransactionCount({ address, network });
  return value;
});

type EstimateNetworkFeeFn = typeof estimateNetworkFee;

export async function getNetworkFeeEstimation(
  params: Omit<Parameters<EstimateNetworkFeeFn>[0], 'getNonce'>
): ReturnType<EstimateNetworkFeeFn> {
  return estimateNetworkFee({ ...params, getNonce: fetchNonce });
}
