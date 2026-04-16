import { ApiClient } from '@/shared/request/api.client';
import { WalletPortfolioPnl } from '@/shared/request/external/wallet-get-portfolio-pnl';
import { useIsTestnetMode } from '@/ui/features/preferences';
import { useQuery } from '@tanstack/react-query';

interface Params {
  addresses: string[];
  enabled?: boolean;
}

export function useWalletPortfolioPnl({ addresses, enabled = true }: Params) {
  const isTestnetMode = useIsTestnetMode();

  return useQuery<WalletPortfolioPnl | null>({
    queryKey: ['wallet/portfolio-pnl', addresses],
    queryFn: async () => {
      const res = await ApiClient.walletGetPortfolioPnl({
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
