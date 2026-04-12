import type { Options as KyOptions } from 'ky';
import { getGasPrices } from './external/get-gas-prices';
import { securityCheckUrl } from './external/security-check-url';
import { walletGetAddressActivity } from './external/wallet-get-address-activity';
import { getWalletsMeta } from './external/wallet-get-meta';

export interface ApiContext {
  getAddressProviderHeader(address: string): Promise<string>;
  getKyOptions(): KyOptions;
}

export const ApiBare = {
  getGasPrices,
  securityCheckUrl,
  walletGetAddressActivity,
  getWalletsMeta,
};

export type ApiBareType = ApiContext & typeof ApiBare;
