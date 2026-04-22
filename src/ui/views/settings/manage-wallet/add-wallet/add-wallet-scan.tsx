import { isSessionExpiredError } from '@/shared/isSessionExpiredError';
import {
  DerivedWallets,
  prepareWalletsToImport,
} from '@/ui/components/ImportWallet/Mnemonic/helpers';
import { Processing } from '@/ui/components/processing';
import { usePortfolioValues } from '@/ui/hooks/request/external/usePortfolioValues';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { MemoryLocationState } from './memoryLocationState';
import { useMnenomicPhraseForLocation } from './useMnemonicLocal';

export function AddWalletScanView({
  onNextStep,
  onSessionExpired,
  locationStateStore,
}: {
  onNextStep: () => void;
  onSessionExpired: () => void;
  locationStateStore: MemoryLocationState;
}) {
  const { phrase, isLoading: isLoadingPhrase } = useMnenomicPhraseForLocation({
    locationStateStore,
  });

  const { data, isError, error } = useQuery({
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

  useEffect(() => {
    if (isError && isSessionExpiredError(error)) {
      onSessionExpired();
    }
  }, [isError, error, onSessionExpired]);

  const { isLoading: isCheckingBalance } = usePortfolioValues(
    data?.addressesToCheck || []
  );

  const isScanning = isLoadingPhrase || !data || isCheckingBalance;

  useEffect(() => {
    if (!isScanning && data) {
      onNextStep();
    }
  }, [isScanning, data, onNextStep]);

  return (
    <Processing
      title="Scanning your wallets"
      description="Please wait while we scan your wallets..."
    />
  );
}
