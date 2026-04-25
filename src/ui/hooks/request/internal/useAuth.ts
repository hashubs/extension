import { accountPublicRPCPort, walletPort } from '@/shared/channels';
import { queryClient } from '@/shared/query-client/queryClient';
import { PublicUser } from '@/shared/types/User';
import { wait } from '@/shared/wait';
import { useMutation, useQuery } from '@tanstack/react-query';

export const AUTH_STATE_QUERY_KEY = ['authState'];

export const useAuthState = () => {
  const { data, isFetching } = useQuery({
    queryKey: ['authState'],
    queryFn: async () => {
      const [isAuthenticated, existingUser, wallet] = await Promise.all([
        accountPublicRPCPort.request('isAuthenticated'),
        accountPublicRPCPort.request('getExistingUser'),
        walletPort.request('uiGetCurrentWallet'),
      ]);
      return {
        isAuthenticated,
        existingUser,
        wallet,
      };
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
  const { isAuthenticated, existingUser, wallet } = data || {};
  return {
    isAuthenticated,
    existingUser,
    hasWallet: Boolean(wallet),
    isLoading: isFetching,
  };
};

interface UseLoginOptions {
  onSuccess?: () => void;
  onAfterInvalidate?: () => void;
}

export function useLogin({
  onSuccess,
  onAfterInvalidate,
}: UseLoginOptions = {}) {
  return useMutation({
    mutationFn: ({ user, password }: { user: PublicUser; password: string }) =>
      accountPublicRPCPort.request('login', { user, password }),
    onSuccess: async () => {
      onSuccess?.();
      await wait(100);
      queryClient.invalidateQueries({ queryKey: AUTH_STATE_QUERY_KEY });
      onAfterInvalidate?.();
    },
  });
}
