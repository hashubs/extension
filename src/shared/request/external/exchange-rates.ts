import { ApiContext } from '../api-bare';
import { ClientOptions, HttpClient } from '../shared';

export type CurrencyType = 'crypto' | 'fiat' | 'commodity';

export interface ExchangeRate {
  name: string;
  ticker: string;
  value: number;
  currencyType: CurrencyType;
}

export type ExchangeRatesResponse = Record<string, ExchangeRate>;

interface Params {
  baseCurrency: string;
}

export function exchangeRates(
  this: ApiContext,
  payload: Params,
  options: ClientOptions = { source: 'mainnet' }
) {
  const params = new URLSearchParams({ baseCurrency: payload.baseCurrency });
  const kyOptions = this.getKyOptions();
  const endpoint = `exchange/rates?${params}`;
  return HttpClient.get<ExchangeRatesResponse>(
    { endpoint, ...options },
    kyOptions
  );
}
