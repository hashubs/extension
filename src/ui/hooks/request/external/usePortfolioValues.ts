import { ApiClient } from '@/shared/request/api.client';
import { useQuery } from '@tanstack/react-query';

type PortfolioValuesData = Awaited<
  ReturnType<typeof ApiClient.walletGetPortfolioValues>
>['data'];

const MAX_ADDRESSES = 30;

export function usePortfolioValues(addresses: string[]) {
  const trimmedAddresses = addresses.slice(0, MAX_ADDRESSES);

  return useQuery<PortfolioValuesData>({
    queryKey: ['portfolioValues', trimmedAddresses] as const,
    queryFn: async () => {
      const payload = { addresses: trimmedAddresses, currency: 'usd' };
      const response = await ApiClient.walletGetPortfolioValues(payload);
      return response.data;
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
    enabled: trimmedAddresses.length > 0,
  });
}
