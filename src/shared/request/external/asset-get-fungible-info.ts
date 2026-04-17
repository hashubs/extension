import { invariant } from '@/shared/invariant';
import { ApiContext } from '../api-bare';
import { CLIENT_DEFAULTS, ClientOptions, HttpClient } from '../shared';

export interface ChainInfo {
  caip: string; // CAIP-19 prefix or chain ID
  chain: string; // Chain name
  chainId: number;
  address: string;
}

export interface TokenLinks {
  website: string | null;
  twitter: string | null;
  discord: string | null;
}

export interface TokenMetadata {
  logoUrl?: string;
  description?: string; // only present for native tokens
  links?: TokenLinks;
  availableOn?: ChainInfo[];
}

export interface TokenMarket {
  price?: number | null;
  marketCap?: number | null;
  allTimeHigh?: number | null;
  allTimeLow?: number | null;
  totalVolume?: number | null;
  circulatingSupply?: number | null;
  dilutedMarketCap?: number | null;
}

export interface TokenPairItem {
  address: string;
  symbol: string;
}

export interface TokenPair {
  address: string;
  token0: TokenPairItem;
  token1: TokenPairItem;
}

export interface FungibleInfo {
  id: string;
  assetId: string;
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  verified?: boolean;
  metadata?: TokenMetadata;
  market?: TokenMarket | null;
  pair?: TokenPair;
}

export interface Response {
  data: FungibleInfo;
}

export async function assetGetFungibleInfo(
  this: ApiContext,
  id: string,
  options: ClientOptions = CLIENT_DEFAULTS
) {
  invariant(id, 'Asset ID is required');
  const kyOptions = this.getKyOptions();
  const endpoint = `/asset/fungible?id=${id}`;
  return await HttpClient.get<Response>(
    {
      endpoint,
      ...options,
    },
    kyOptions
  );
}
