import { ApiContext } from '../api-bare';
import { CLIENT_DEFAULTS, ClientOptions, HttpClient } from '../shared';
import { Payload } from '../types/payload';

export type PnlEntry = {
  value: number;
  relative: number;
};

export type WalletPortfolioPnl = {
  realized: PnlEntry;
  unrealized: PnlEntry;
  total: PnlEntry;
};

export interface Response {
  data: WalletPortfolioPnl;
}

export async function walletGetPortfolioPnl(
  this: ApiContext,
  params: Payload,
  options: ClientOptions = CLIENT_DEFAULTS
) {
  const kyOptions = this.getKyOptions();
  const endpoint = '/wallet/portfolio/pnl';
  return await HttpClient.post<Response>(
    {
      endpoint,
      body: JSON.stringify(params),
      ...options,
    },
    kyOptions
  );
}
