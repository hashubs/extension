import { currencyPort } from '@/shared/channel';
import { useCurrency } from '@/ui/features/appearance';
import { useQuery } from '@tanstack/react-query';

export function useExchangeRates() {
  const { currency } = useCurrency();

  return useQuery({
    queryKey: ['exchange-rates', currency],
    queryFn: async () => {
      return await currencyPort.request('getExchangeRates', {
        baseCurrency: currency,
      });
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}
