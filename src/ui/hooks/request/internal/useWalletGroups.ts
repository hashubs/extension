import { walletPort } from '@/shared/channel';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export const WALLET_GROUPS_QUERY_KEY = ['wallet/uiGetWalletGroups'];

export const fetchWalletGroups = () => walletPort.request('uiGetWalletGroups');

export function useWalletGroups() {
  return useQuery({
    queryKey: WALLET_GROUPS_QUERY_KEY,
    queryFn: fetchWalletGroups,
    staleTime: 1000 * 60,
  });
}

export function usePrefetchWalletGroups() {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: WALLET_GROUPS_QUERY_KEY,
      queryFn: fetchWalletGroups,
    });
  }, [queryClient]);
}
