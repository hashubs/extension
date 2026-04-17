import { NetworkConfig } from '@/modules/networks/network-config';
import { ApiClient } from '@/shared/request/api.client';
import { useQuery } from '@tanstack/react-query';

interface TokenBalance {
  tokenAddress?: string;
  decimals?: number;
  walletAddress?: string;
  chainData?: NetworkConfig;
  enabled?: boolean;
}

export function useSingleTokenBalance({
  tokenAddress,
  decimals,
  walletAddress,
  chainData,
  enabled = true,
}: TokenBalance) {
  return useQuery({
    queryKey: ['asset/token-balances', 'token', tokenAddress, walletAddress],
    queryFn: async () => {
      if (!tokenAddress || !chainData || !walletAddress) return null;
      return ApiClient.rpcTokenBalancesSingle(
        chainData,
        tokenAddress,
        walletAddress,
        decimals ?? 18
      );
    },
    enabled: enabled && !!tokenAddress && !!walletAddress,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useNativeTokenBalance({
  chainData,
  walletAddress,
  enabled = true,
}: TokenBalance) {
  const caip = `${chainData?.standard}:${chainData?.specification.eip155?.id}`;
  return useQuery({
    queryKey: ['asset/token-balances', 'native', caip, walletAddress],
    queryFn: async () => {
      if (!chainData || !walletAddress) return null;
      return ApiClient.rpcTokenNativeBalanceSingle(chainData, walletAddress);
    },
    enabled: enabled && !!chainData && !!walletAddress,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}
