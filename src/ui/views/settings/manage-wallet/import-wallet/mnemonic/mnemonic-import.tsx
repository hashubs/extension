import { walletPort } from '@/shared/channel';
import {
  DerivedWallets,
  prepareWalletsToImport,
} from '@/ui/components/ImportWallet/Mnemonic/helpers';
import { Processing } from '@/ui/components/processing';
import { usePortfolioValues } from '@/ui/hooks/request/external/usePortfolioValues';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  MemoryLocationState,
  useMemoryLocationState,
} from '../memoryLocationState';
import { AddressImportFlow } from './address-Import-flow';

function useMnenomicPhraseForLocation({
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
  if (!phraseFromState && !groupId) {
    throw new Error('View data expired');
  }
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
    enabled: !phraseFromState,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  if (phraseFromState) {
    return { phrase: phraseFromState, isLoading: false, isError: false };
  } else {
    return {
      phrase: getRecoveryPhraseQuery.data,
      isLoading: getRecoveryPhraseQuery.isLoading,
      isError: getRecoveryPhraseQuery.isError,
    };
  }
}

export function MnemonicImportView({
  locationStateStore,
}: {
  locationStateStore: MemoryLocationState;
}) {
  const { phrase, isLoading: isLoadingPhrase } = useMnenomicPhraseForLocation({
    locationStateStore,
  });

  const { data } = useQuery({
    queryKey: ['prepareWalletsToImport', phrase],
    queryFn: async (): Promise<{
      derivedWallets: DerivedWallets;
      addressesToCheck: string[];
    } | void> => {
      if (!phrase) {
        return;
      }
      return prepareWalletsToImport(phrase);
    },
    enabled: Boolean(phrase),
  });

  const { data: activeWallets, isLoading: isCheckingBalance } =
    usePortfolioValues(data?.addressesToCheck || []);

  const isScanning = isLoadingPhrase || !data || isCheckingBalance;

  if (isScanning) {
    return (
      <Processing
        title="Scanning your wallets"
        description="Please wait while we scan your wallets..."
      />
    );
  }
  return (
    <AddressImportFlow
      wallets={data.derivedWallets}
      activeWallets={activeWallets ?? {}}
    />
  );
}
