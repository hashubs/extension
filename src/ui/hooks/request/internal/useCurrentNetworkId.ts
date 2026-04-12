import { useQuery, useQueryClient } from '@tanstack/react-query';
import { walletPort } from '@/shared/channel';
import { useEffect } from 'react';

export const CURRENT_NETWORK_QUERY_KEY = ['wallet/getCurrentNetworkId'];

export const fetchCurrentNetworkId = () =>
  walletPort.request('getCurrentNetworkId').then((result) => result || null);

export function useCurrentNetworkId() {
  const { data: networkId = null, ...query } = useQuery({
    queryKey: CURRENT_NETWORK_QUERY_KEY,
    queryFn: fetchCurrentNetworkId,
    staleTime: Infinity,
  });

  return {
    networkId,
    ...query,
  };
}

export function usePrefetchCurrentNetworkId() {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: CURRENT_NETWORK_QUERY_KEY,
      queryFn: fetchCurrentNetworkId,
    });
  }, [queryClient]);
}
