import { ApiClient } from '@/shared/request/api.client';
import { WalletPortfolioSummary } from '@/shared/request/external/wallet-get-portfolio-summary';
import { useIsTestnetMode } from '@/ui/features/preferences';
import { useQuery } from '@tanstack/react-query';

interface Params {
  addresses: string[];
  enabled?: boolean;
}

export function useWalletPortfolioSummary({
  addresses,
  enabled = true,
}: Params) {
  const isTestnetMode = useIsTestnetMode();

  return useQuery<WalletPortfolioSummary | null>({
    queryKey: ['wallet/portfolio-summary', addresses],
    queryFn: async () => {
      const res = await ApiClient.walletGetPortfolioSummary({
        addresses: addresses.filter(Boolean),
        currency: 'usd',
        mode: 'mainnet',
      });
      return res.data;
    },
    enabled: enabled && addresses.length > 0 && !isTestnetMode,
    staleTime: 30_000,
  });
}
