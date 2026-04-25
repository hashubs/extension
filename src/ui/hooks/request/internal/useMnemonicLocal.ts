import { walletPort } from '@/shared/channels';
import {
  MemoryLocationState,
  useMemoryLocationState,
} from '@/ui/shared/memoryLocationState';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

export function useMnenomicPhraseForLocation({
  locationStateStore,
}: {
  locationStateStore: MemoryLocationState;
}) {
  /**
   * Get phrase from
   * - either locationState
   * - or resolve from groupId in searchParams
   */
  const { value: phraseFromState } = useMemoryLocationState(locationStateStore);
  const [params] = useSearchParams();
  const groupId = params.get('groupId');

  const getRecoveryPhraseQuery = useQuery({
    queryKey: [`getRecoveryPhrase(${groupId})`],
    queryFn: async () => {
      const mnemonic = await walletPort.request('getRecoveryPhrase', {
        groupId: groupId as string, // can cast to string cause of "enabled" option
      });
      if (!mnemonic) {
        throw new Error(`Missing mnemonic for ${groupId}`);
      }
      return mnemonic.phrase;
    },
    enabled: !phraseFromState && !!groupId,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (phraseFromState) {
    return {
      phrase: phraseFromState,
      isLoading: false,
      isError: false,
      error: null,
    };
  }

  if (!groupId) {
    return {
      phrase: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Session expired'),
    };
  }

  return {
    phrase: getRecoveryPhraseQuery.data,
    isLoading: getRecoveryPhraseQuery.isLoading,
    isError: getRecoveryPhraseQuery.isError,
    error: getRecoveryPhraseQuery.error,
  };
}
