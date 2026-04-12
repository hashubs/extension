import type { ChainGasPrice } from '@/modules/ethereum/transactions/gasPrices/types';
import type { Chain } from '@/modules/networks/chain';
import type { ApiContext } from '../api-bare';
import type { ClientOptions } from '../shared';
import { HttpClient } from '../shared';

interface Params {
  chain: Chain;
}

interface Response {
  data: ChainGasPrice;
  errors?: { title: string; detail: string }[];
}

export function getGasPrices(
  this: ApiContext,
  { chain }: Params,
  options?: ClientOptions
) {
  const params = new URLSearchParams({ chain: chain.toString() });
  const kyOptions = this.getKyOptions();
  const endpoint = `chain/get-gas-prices/v1?${params}`;
  return HttpClient.get<Response>({ endpoint, ...options }, kyOptions);
}
