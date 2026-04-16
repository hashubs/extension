import {
  SanitizedPortfolio,
  sanitizePortfolio,
} from '@/shared/fungible/sanitize-portfolio';
import { buildFromServerBalance } from '@/shared/fungible/token-builders';
import { ApiClient } from '@/shared/request/api.client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useWalletAddresses } from '../internal/useWalletAddresses';

interface Params {
  addresses: string[];
  enabled?: boolean;
  mode: 'mainnet' | 'testnet';
}

export function useWalletPortfolio({
  addresses,
  enabled = true,
  mode = 'mainnet',
}: Params) {
  return useQuery<SanitizedPortfolio[]>({
    queryKey: ['wallet/portfolio', addresses, mode],
    queryFn: async () => {
      const res = await ApiClient.walletGetPortfolio({
        addresses: addresses.filter(Boolean),
        currency: 'usd',
        portfolioType: 'asset',
        mode,
      });
      return res.data.map((item) =>
        buildFromServerBalance(sanitizePortfolio(item), mode === 'testnet')
      );
    },
    enabled: enabled && addresses.length > 0,
    staleTime: 30_000,
  });
}

export function usePrefetchWalletPortfolio() {
  const queryClient = useQueryClient();
  const { data: addresses } = useWalletAddresses();

  useEffect(() => {
    if (!addresses || addresses.length === 0) return;

    const modes: ('mainnet' | 'testnet')[] = ['mainnet', 'testnet'];

    modes.forEach((mode) => {
      queryClient.prefetchQuery({
        queryKey: ['wallet-portfolio', addresses, mode],
        queryFn: async () => {
          const res = await ApiClient.walletGetPortfolio({
            addresses: addresses.filter(Boolean),
            currency: 'usd',
            portfolioType: 'asset',
            mode,
          });
          return res.data.map((item) =>
            buildFromServerBalance(sanitizePortfolio(item), mode === 'testnet')
          );
        },
        staleTime: 30_000,
      });
    });
  }, [addresses, queryClient]);
}
