import type { Options as KyOptions } from 'ky';
import { getGasPrices } from './requests/get-gas-prices';
import { securityCheckUrl } from './requests/security-check-url';
import { walletGetAddressActivity } from './requests/wallet-get-address-activity';
import { getWalletsMeta } from './requests/wallet-get-meta';

export interface YounoApiContext {
  getAddressProviderHeader(address: string): Promise<string>;
  getKyOptions(): KyOptions;
}

export const YounoApiBare = {
  getGasPrices,
  securityCheckUrl,
  walletGetAddressActivity,
  getWalletsMeta,
};

export type YounoApiClient = YounoApiContext & typeof YounoApiBare;
