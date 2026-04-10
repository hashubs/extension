import { walletPort } from '@/shared/channel';
import { useQuery } from '@tanstack/react-query';

export function usePhishingDefenceStatus(origin?: string | null) {
  return useQuery({
    queryKey: ['wallet/getDappSecurityStatus', origin],
    queryFn: () => {
      return walletPort.request('getDappSecurityStatus', {
        url: origin,
      });
    },
    cacheTime: 0,
    suspense: false,
    refetchInterval: (data) =>
      data?.status === 'loading' || data?.status === 'unknown' ? 100 : false,
  });
}
