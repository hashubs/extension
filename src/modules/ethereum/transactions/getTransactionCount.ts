import { SLOW_MODE } from '@/env/config';
import { type NetworkConfig } from '@/modules/networks/network-config';
import { Networks } from '@/modules/networks/networks';
import { sendRpcRequest } from '@/shared/custom-rpc/rpc-request';
import { invariant } from '@/shared/invariant';
import { wait } from '@/shared/wait';
import { getLatestLocallyKnownNonce } from './getLatestKnownNonce';
import type { StoredTransactions } from './types';

export async function getTransactionCount({
  address,
  network,
  defaultBlock = 'latest',
}: {
  address: string;
  network: NetworkConfig;
  defaultBlock?: 'latest' | 'earliest' | 'pending' | 'genesis';
}) {
  const url = Networks.getNetworkRpcUrlInternal(network);

  if (SLOW_MODE) {
    await wait(2000);
  }

  const { result } = await sendRpcRequest<string>(url, {
    method: 'eth_getTransactionCount',
    params: [address, defaultBlock],
  });
  return { value: parseInt(result), source: new URL(url).origin };
}

export async function getBestKnownTransactionCount(
  state: StoredTransactions,
  params: Parameters<typeof getTransactionCount>[0]
): ReturnType<typeof getTransactionCount> {
  const transactionCount = await getTransactionCount(params);
  const { address, network } = params;
  const chainId = Networks.getChainId(network);
  invariant(chainId, 'Unable to find network info for generating the nonce');
  const latestNonce = getLatestLocallyKnownNonce({ state, address, chainId });
  const nonce = Math.max(latestNonce + 1, transactionCount.value);
  return { ...transactionCount, value: nonce };
}
