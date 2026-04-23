import { ApiContext } from '../api-bare';
import { CLIENT_DEFAULTS, ClientOptions, HttpClient } from '../shared';
import { Payload } from '../types/payload';

export type PortfolioType =
  | 'asset'
  | 'deposit'
  | 'loan'
  | 'reward'
  | 'staked'
  | 'locked';

export interface Portfolio {
  id: string;
  assetId: string;
  chainId: number | string;
  address: string;
  decimals: number;
  name: string;
  symbol: string;
  amount: string;
  rawAmount: string;
  valueUsd: number;
  priceUsd: number;
  priceChange: number;
  isVerified?: boolean;
  hidden: boolean;
  type: 'TOKEN_TYPE_NATIVE' | 'TOKEN_TYPE_ERC20' | 'TOKEN_TYPE_SPL';
}

export interface Response {
  data: Portfolio[];
}

export async function walletGetPortfolio(
  this: ApiContext,
  params: Payload,
  options: ClientOptions = CLIENT_DEFAULTS
) {
  const kyOptions = this.getKyOptions();
  const endpoint = '/wallet/portfolio';
  return await HttpClient.post<Response>(
    {
      endpoint,
      body: JSON.stringify(params),
      ...options,
    },
    kyOptions
  );
}
