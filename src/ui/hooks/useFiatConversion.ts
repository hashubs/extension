import { useCurrency } from '@/modules/currency/useCurrency';
import { useCallback } from 'react';
import { useExchangeRates } from './request/external/use-exchange-rates';

export function useFiatConversion() {
  const { data: exchangeRates } = useExchangeRates();
  const { currency: defaultCurrency, symbol, ticker } = useCurrency();

  const convertUsdToFiat = useCallback(
    (usdValue: number): number => {
      if (!exchangeRates) return usdValue;
      if (defaultCurrency.toLowerCase() === 'usd') return usdValue;

      const usdRate = exchangeRates['usd'] || 0;
      return usdRate > 0 ? usdValue / usdRate : usdValue;
    },
    [exchangeRates, defaultCurrency]
  );

  return {
    convertUsdToFiat,
    defaultCurrency,
    symbol,
    ticker,
    isLoading: !exchangeRates,
  };
}
