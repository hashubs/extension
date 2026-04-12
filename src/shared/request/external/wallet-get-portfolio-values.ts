import { invariant } from '@/shared/invariant';
import { Payload } from '@/shared/request/types/payload';
import { ApiContext } from '../api-bare';
import { CLIENT_DEFAULTS, HttpClient, type ClientOptions } from '../shared';

export type PortfolioValuesData = Record<string, { totalValue: number }>;

export interface Response {
  data: PortfolioValuesData;
}

export async function walletGetPortfolioValues(
  this: ApiContext,
  params: Payload,
  options: ClientOptions = CLIENT_DEFAULTS
) {
  invariant(params.addresses.length > 0, 'Addresses param is empty');
  const kyOptions = this.getKyOptions();
  const endpoint = '/wallet/portfolio/values';
  return await HttpClient.post<Response>(
    {
      endpoint,
      body: JSON.stringify(params),
      ...options,
    },
    kyOptions
  );
}
