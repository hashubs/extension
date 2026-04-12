import { walletPort } from '@/shared/channel';
import { queryClient } from '@/shared/query-client/queryClient';
import type { GlobalPreferences } from '@/shared/types/global-preferences';
import type { WalletRecord } from '@/shared/types/wallet-record';
import { useOptimisticMutation } from '@/ui/hooks/request/internal/useOptimisticMutation';
import { useQuery } from '@tanstack/react-query';

type Preferences = WalletRecord['publicPreferences'];

async function setPreferences(preferences: Preferences) {
  await walletPort.request('setPreferences', { preferences });
}

export async function getPreferences() {
  return queryClient.fetchQuery({
    queryKey: ['wallet/getPreferences'],
    queryFn: () => walletPort.request('getPreferences'),
  });
}

export function usePreferences() {
  const query = useQuery({
    queryKey: ['wallet/getPreferences'],
    queryFn: () => walletPort.request('getPreferences'),
  });
  const mutation = useOptimisticMutation(setPreferences, {
    relatedQueryKey: ['wallet/getPreferences'],
    onMutate: ({ client, variables }) => {
      client.setQueryData<Preferences>(
        ['wallet/getPreferences'],
        (preferences) => ({ ...preferences, ...variables })
      );
    },
  });
  return {
    query,
    preferences: query.data,
    mutation,
    setPreferences: mutation.mutate,
  };
}

async function setGlobalPreferences(preferences: GlobalPreferences) {
  walletPort.request('setGlobalPreferences', { preferences });
}

export async function fetchGlobalPreferences() {
  return queryClient.fetchQuery({
    queryKey: ['wallet/getGlobalPreferences'],
    queryFn: () => walletPort.request('getGlobalPreferences'),
  });
}

export function useGlobalPreferences() {
  const query = useQuery({
    queryKey: ['wallet/getGlobalPreferences'],
    queryFn: () => walletPort.request('getGlobalPreferences'),
  });

  const mutation = useOptimisticMutation(setGlobalPreferences, {
    relatedQueryKey: ['wallet/getGlobalPreferences'],
    onMutate: ({ client, variables }) =>
      client.setQueryData<GlobalPreferences>(
        ['wallet/getGlobalPreferences'],
        (globalPreferences) => ({ ...globalPreferences, ...variables })
      ),
  });
  return {
    query,
    globalPreferences: query.data,
    mutation,
    setGlobalPreferences: mutation.mutate,
    setGlobalPreferencesAsync: mutation.mutateAsync,
  };
}
