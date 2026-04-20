import { preferenceStore } from '@/ui/features/appearance';
import { useStore } from '@store-unit/react';
import fiatData from '@/ui/views/settings/currency/fiat.json';

export function useCurrency() {
  const { currency } = useStore(preferenceStore) as { currency: string };
  const currencyInfo = (fiatData as Record<string, any>)[currency] || fiatData['usd'];

  return {
    currency,
    symbol: currencyInfo.symbol,
    ticker: currencyInfo.ticker.toUpperCase(),
  };
}
