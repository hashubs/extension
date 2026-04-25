import { getPasswordWithPasskey, setupAccountPasskey } from '@/modules/passkey';
import { accountPublicRPCPort, walletPort } from '@/shared/channels';
import { invariant } from '@/shared/invariant';
import { queryClient } from '@/shared/query-client/queryClient';
import { useToastStore } from '@/shared/store/useToastStore';
import { PublicUser } from '@/shared/types/User';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useGetExistingUser } from './useAccount';

export const GET_PASSKEY_ENABLED_QUERY_KEY = ['account/getPasskeyEnabled'];

export function getPasskeyEnabled() {
  return useQuery({
    queryKey: GET_PASSKEY_ENABLED_QUERY_KEY,
    queryFn: () => accountPublicRPCPort.request('getPasskeyEnabled'),
  });
}

interface UseRemovePasskeyOptions {
  onSuccess?: () => void;
}

export function useRemovePasskey({ onSuccess }: UseRemovePasskeyOptions = {}) {
  return useMutation({
    mutationFn: () => accountPublicRPCPort.request('removePasskey'),
    onSuccess: () => {
      walletPort.request('passkeyLoginDisabled');
      queryClient.invalidateQueries({
        queryKey: GET_PASSKEY_ENABLED_QUERY_KEY,
      });
      onSuccess?.();
    },
  });
}

interface UsePasskeyLoginOptions {
  user: PublicUser | undefined;
  passkeyEnabled: boolean | undefined;
  onSuccess?: () => void;
}

export function usePasskeyLogin({
  user,
  passkeyEnabled,
  onSuccess,
}: UsePasskeyLoginOptions) {
  const { show: showToast } = useToastStore();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!passkeyEnabled) {
        showToast('Passkey login is not enabled for this account');
        return;
      }
      invariant(user, 'user is required');
      const password = await getPasswordWithPasskey();
      return accountPublicRPCPort.request('login', { user, password });
    },
    onSuccess,
  });

  return { mutation };
}

export function usePasskeyAvailability() {
  return useQuery({
    queryKey: ['passkey/isSupported'],
    queryFn: async () => {
      if (!window.PublicKeyCredential) return false;
      try {
        return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      } catch {
        return false;
      }
    },
    staleTime: Infinity,
  });
}

export function useSetupPasskey({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  const userQuery = useGetExistingUser();

  return useMutation({
    mutationFn: async (password: string) => {
      invariant(userQuery.data, 'User must be defined');
      await accountPublicRPCPort.request('login', {
        user: userQuery.data,
        password,
      });
      return setupAccountPasskey(password);
    },
    onSuccess: () => {
      walletPort.request('passkeyLoginEnabled');
      queryClient.invalidateQueries({
        queryKey: GET_PASSKEY_ENABLED_QUERY_KEY,
      });
      onSuccess?.();
    },
  });
}
