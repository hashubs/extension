import type { Options as KyOptions } from 'ky';
import { getGasPrices } from './external/get-gas-prices';
import { securityCheckUrl } from './external/security-check-url';
import { walletGetMetadata } from './external/wallet-get-meta';
import { walletGetPortfolioValues } from './external/wallet-get-portfolio-values';

export interface ApiContext {
  getAddressProviderHeader(address: string): Promise<string>;
  getKyOptions(): KyOptions;
}

export const ApiBare = {
  getGasPrices,
  securityCheckUrl,

  walletGetPortfolioValues,
  walletGetMetadata,
};

export type ApiBareType = ApiContext & typeof ApiBare;
