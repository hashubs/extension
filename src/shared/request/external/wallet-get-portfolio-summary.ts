import { invariant } from '@/shared/invariant';
import { ApiContext } from '../api-bare';
import { CLIENT_DEFAULTS, ClientOptions, HttpClient } from '../shared';
import { Payload } from '../types/payload';

type ChainsDistribution = Record<string, number>;

type PositionsTypesDistribution = {
  assets: number;
  borrowed: number;
  deposited: number;
  locked: number;
  staked: number;
};

type NftPrices = {
  floorPrice: number;
  lastPrice: number;
};

type Change24h = {
  absolute: number;
  relative: number;
};

export type WalletPortfolioSummary = {
  chainDistribution: ChainsDistribution;
  typeDistribution: PositionsTypesDistribution;
  nftChainDistribution: Record<string, number>;
  nftPrices: NftPrices;
  change24h: Change24h;
  totalValue: number;
};

export interface Response {
  data: WalletPortfolioSummary;
}

export async function walletGetPortfolioSummary(
  this: ApiContext,
  params: Payload,
  options: ClientOptions = CLIENT_DEFAULTS
) {
  invariant(params.addresses.length > 0, 'Addresses param is empty');
  const kyOptions = this.getKyOptions();
  const endpoint = '/wallet/portfolio/summary';
  return await HttpClient.post<Response>(
    {
      endpoint,
      body: JSON.stringify(params),
      ...options,
    },
    kyOptions
  );
}
