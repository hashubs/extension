import { walletPort } from '@/shared/channel';
import { checkForTestAddress } from '@/shared/meta-app-state';
import { queryClient } from '@/shared/query-client/queryClient';
import { WalletGroup } from '@/shared/types/wallet-group';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useEvent } from '../../useEvent';

export const WALLET_GROUPS_QUERY_KEY = ['wallet/uiGetWalletGroups'];
export const WALLET_GROUP_QUERY_KEY = ['wallet/uiGetWalletGroup'];

export const fetchWalletGroups = () => walletPort.request('uiGetWalletGroups');

export function useWalletGroups() {
  return useQuery({
    queryKey: WALLET_GROUPS_QUERY_KEY,
    queryFn: fetchWalletGroups,
    staleTime: 1000 * 60 * 5,
  });
}

export function usePrefetchWalletGroups() {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: WALLET_GROUPS_QUERY_KEY,
      queryFn: fetchWalletGroups,
      staleTime: 1000 * 60 * 5,
    });
  }, [queryClient]);
}

export function useWalletGroupByGroupId({ groupId }: { groupId: string }) {
  return useQuery({
    queryKey: [...WALLET_GROUP_QUERY_KEY, groupId],
    queryFn: () => walletPort.request('uiGetWalletGroup', { groupId }),
    staleTime: 1000 * 60 * 5,
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

export function usePrefetchWalletGroupDetails(
  walletGroups?: WalletGroup[] | null
) {
  useEffect(() => {
    if (walletGroups) {
      walletGroups.forEach((group) => {
        queryClient.prefetchQuery({
          queryKey: ['wallet/uiGetWalletGroup', group.id],
          queryFn: () =>
            walletPort.request('uiGetWalletGroup', { groupId: group.id }),
          staleTime: 1000 * 60 * 5,
        });
      });
    }
  }, [walletGroups, queryClient]);
}
