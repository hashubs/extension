import type { RemoteConfig } from '@/modules/remote-config/types';
import { walletPort } from '@/shared/channel';
import { useQuery } from '@tanstack/react-query';

export function useRemoteConfigValue<K extends keyof RemoteConfig>(key: K) {
  return useQuery({
    queryKey: ['wallet/getRemoteConfigValue', key],
    queryFn: async () => {
      const value = await walletPort.request('getRemoteConfigValue', { key });
      return value as RemoteConfig[K];
    },
    staleTime: 10000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
