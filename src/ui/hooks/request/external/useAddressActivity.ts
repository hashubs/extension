import { YounoAPI } from '@/shared/youno-api/youno-api.client';
import { useQuery } from '@tanstack/react-query';

interface UseAddressActivityParams {
  addresses: string[];
}

interface UseAddressActivityOptions {
  enabled?: boolean;
}

const MAX_ADDRESSES = 30;

export function useAddressActivity(
  params: UseAddressActivityParams,
  options?: UseAddressActivityOptions
) {
  const trimmedAddresses = params.addresses.slice(0, MAX_ADDRESSES);

  return useQuery({
    queryKey: ['addressActivity', trimmedAddresses],
    queryFn: async () => {
      const payload = { addresses: trimmedAddresses, currency: 'usd' };
      const response = await YounoAPI.walletGetAddressActivity(payload);
      return response.data;
    },
    enabled: options?.enabled && trimmedAddresses.length > 0,
    staleTime: 5000,
    refetchOnWindowFocus: false,
    suspense: true,
    useErrorBoundary: true,
  });
}
