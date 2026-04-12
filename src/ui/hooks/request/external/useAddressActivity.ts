import { ApiClient } from '@/shared/request/api.client';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

type AddressActivityData = Awaited<
  ReturnType<typeof ApiClient.walletGetAddressActivity>
>['data'];

interface UseAddressActivityParams {
  addresses: string[];
  options?: Omit<UseQueryOptions<AddressActivityData>, 'queryKey' | 'queryFn'>;
}

const MAX_ADDRESSES = 30;

export function useAddressActivity({
  addresses,
  options,
}: UseAddressActivityParams) {
  const trimmedAddresses = addresses.slice(0, MAX_ADDRESSES);

  return useQuery<AddressActivityData>({
    queryKey: ['addressActivity', trimmedAddresses] as const,
    queryFn: async () => {
      const payload = { addresses: trimmedAddresses, currency: 'usd' };
      const response = await ApiClient.walletGetAddressActivity(payload);
      return response.data;
    },
    staleTime: 5000,
    refetchOnWindowFocus: false,
    ...options,
    enabled: (options?.enabled ?? true) && trimmedAddresses.length > 0,
  });
}
