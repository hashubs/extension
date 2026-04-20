import { walletPort } from '@/shared/channel';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useEvent } from '../../useEvent';
import { WalletGroup } from '@/shared/types/wallet-group';
import { checkForTestAddress } from '@/shared/meta-app-state';

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

export function useWalletGroupByGroupId({ groupId }: { groupId: string }) {
  return useQuery({
    queryKey: ['wallet/uiGetWalletGroup', groupId],
    queryFn: () => walletPort.request('uiGetWalletGroup', { groupId }),
  });
}

export function useWalletGroupsByGroupId(options: { enabled?: boolean } = {}) {
  const onSuccess = useEvent((groups: WalletGroup[] | null) => {
    requestIdleCallback(() => {
      checkForTestAddress(groups);
    });
  });
  return useQuery({
    queryKey: ['wallet/uiGetWalletGroups'],
    queryFn: async () => {
      const result = await walletPort.request('uiGetWalletGroups');
      onSuccess(result);
      return result;
    },
    enabled: options.enabled,
  });
}
