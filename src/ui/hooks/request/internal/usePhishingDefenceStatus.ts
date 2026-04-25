import { walletPort } from '@/shared/channels';
import { useQuery } from '@tanstack/react-query';

export function usePhishingDefenceStatus(origin?: string | null) {
  return useQuery({
    queryKey: ['wallet/getDappSecurityStatus', origin],
    queryFn: () => {
      return walletPort.request('getDappSecurityStatus', {
        url: origin,
      });
    },
    gcTime: 0,
    refetchInterval: (query) =>
      query.state.data?.status === 'loading' ||
      query.state.data?.status === 'unknown'
        ? 100
        : false,
  });
}
