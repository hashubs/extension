import { walletPort } from '@/shared/channel';
import { useQuery } from '@tanstack/react-query';

export function usePrivateKey(address: string) {
  return useQuery({
    queryKey: ['getPrivateKey', address],
    queryFn: () => walletPort.request('getPrivateKey', { address }),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
