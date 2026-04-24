// import { isSessionExpiredError } from '@/shared/isSessionExpiredError';
// import {
//   DerivedWallets,
//   prepareWalletsToImport,
// } from '@/ui/components/ImportWallet/Mnemonic/helpers';
// import { Processing } from '@/ui/components/processing';
// import { usePortfolioValues } from '@/ui/hooks/request/external/usePortfolioValues';
// import { useQuery } from '@tanstack/react-query';
// import { useEffect } from 'react';
// import { useMnenomicPhraseForLocation } from '../../hooks/request/internal/useMnemonicLocal';
// import { MemoryLocationState } from '../../shared/memoryLocationState';

// export function WalletScanView({
//   onNextStep,
//   onSessionExpired,
//   locationStateStore,
// }: {
//   onNextStep: () => void;
//   onSessionExpired: () => void;
//   locationStateStore: MemoryLocationState;
// }) {
//   const { phrase, isLoading: isLoadingPhrase } = useMnenomicPhraseForLocation({
//     locationStateStore,
//   });

//   const { data, isError, error } = useQuery({
//     queryKey: ['prepareWalletsToImport', phrase],
//     queryFn: async (): Promise<{
//       derivedWallets: DerivedWallets;
//       addressesToCheck: string[];
//     } | void> => {
//       if (!phrase) {
//         return;
//       }
//       return prepareWalletsToImport(phrase);
//     },
//     enabled: Boolean(phrase),
//   });

//   useEffect(() => {
//     if (
//       (isError && isSessionExpiredError(error)) ||
//       (!isLoadingPhrase && phrase === undefined)
//     ) {
//       onSessionExpired();
//     }
//   }, [isError, error, onSessionExpired, phrase, isLoadingPhrase]);

//   const { isLoading: isCheckingBalance } = usePortfolioValues(
//     data?.addressesToCheck || []
//   );

//   const isScanning = isLoadingPhrase || !data || isCheckingBalance;

//   useEffect(() => {
//     if (!isScanning && data) {
//       onNextStep();
//     }
//   }, [isScanning, data, onNextStep]);

//   return (
//     <Processing
//       title="Scanning your wallets"
//       description="Please wait while we scan your wallets..."
//     />
//   );
// }
