import type { Options as KyOptions } from 'ky';
import { assetGetFungibleChart } from './external/asset-get-fungible-chart';
import { assetGetFungibleInfo } from './external/asset-get-fungible-info';
import { crawlTokenImages } from './external/crawl-token-images';
import { defillamaGetAssetChart } from './external/defillama-get-asset-chart';
import { defillamaGetPriceFungible } from './external/defillama-get-price-fungible';
import { exchangeRates } from './external/exchange-rates';
import { getGasPrices } from './external/get-gas-prices';
import {
  rpcTokenBalancesBatch,
  rpcTokenBalancesSingle,
  rpcTokenNativeBalanceSingle,
} from './external/rpc/get-balance-token';
import { rpcGetTokenMetadata } from './external/rpc/get-fungible-metadata';
import { securityCheckUrl } from './external/security-check-url';
import { walletGetActions } from './external/wallet-get-actions';
import { walletGetMetadata } from './external/wallet-get-meta';
import { walletGetPortfolio } from './external/wallet-get-portfolio';
import { walletGetPortfolioPnl } from './external/wallet-get-portfolio-pnl';
import { walletGetPortfolioSummary } from './external/wallet-get-portfolio-summary';
import { walletGetPortfolioValues } from './external/wallet-get-portfolio-values';

export interface ApiContext {
  getAddressProviderHeader(address: string): Promise<string>;
  getKyOptions(): KyOptions;
}

export const ApiBare = {
  getGasPrices,
  securityCheckUrl,

  walletGetActions,
  walletGetMetadata,
  walletGetPortfolio,
  walletGetPortfolioPnl,
  walletGetPortfolioSummary,
  walletGetPortfolioValues,

  assetGetFungibleChart,
  assetGetFungibleInfo,

  defillamaGetPriceFungible,
  defillamaGetAssetChart,

  rpcTokenBalancesBatch,
  rpcTokenBalancesSingle,
  rpcTokenNativeBalanceSingle,
  rpcGetTokenMetadata,

  crawlTokenImages,

  exchangeRates,
};

export type ApiBareType = ApiContext & typeof ApiBare;
