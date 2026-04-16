import { getChainCaip } from '@/modules/networks/helpers';
import { NetworkConfig } from '@/modules/networks/network-config';
import { Networks } from '@/modules/networks/networks';
import { parseCaip19 } from '@/shared/chains/parse-caip19';
import { SanitizedPortfolio } from '@/shared/fungible/sanitize-portfolio';
import {
  buildCustomToken,
  buildNativeToken,
} from '@/shared/fungible/token-builders';
import { CustomToken } from '@/shared/fungible/types';
import { ApiClient } from '@/shared/request/api.client';
import { useCustomTokenStore } from '@/shared/store/custom-token-store';
import { getAddressType } from '@/shared/wallet/classifiers';
import { useIsTestnetMode } from '@/ui/features/preferences';
import { useCrawlTokenImages } from '@/ui/hooks/request/external/use-crawl-token-images';
import { useWalletPortfolio } from '@/ui/hooks/request/external/use-wallet-portfolio';
import { useNetworks } from '@/ui/hooks/request/internal/useNetworks';
import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

export function useDiscoveredTokens(
  address: string | null,
  activeNetworkId: string | null = null
) {
  const isTestnetMode = useIsTestnetMode();
  const mode = isTestnetMode ? 'testnet' : 'mainnet';

  const { networks, isLoading: isNetworksLoading } = useNetworks();

  const allNetworks = useMemo(() => {
    return networks?.getNetworks() || [];
  }, [networks]);

  const allCustomTokens = useCustomTokenStore((s) => s.customTokens);

  const addressType = useMemo(() => {
    return address ? getAddressType(address) : null;
  }, [address]);

  const activeChains = useMemo(() => {
    if (!address || !addressType) return [];

    const baseNetworks = allNetworks.filter(
      (n: NetworkConfig) =>
        Networks.predicate(addressType as any, n) &&
        Boolean(n.is_testnet) === (mode === 'testnet') &&
        !n.hidden
    );
    if (activeNetworkId && activeNetworkId !== 'all') {
      const filtered = baseNetworks.filter(
        (n: NetworkConfig) => n.id === activeNetworkId
      );
      if (filtered.length > 0) return filtered;
    }

    return baseNetworks;
  }, [allNetworks, address, addressType, activeNetworkId, mode]);

  const customTokens = useMemo(() => {
    return allCustomTokens.filter((token: CustomToken) => {
      return token.accountAddress?.toLowerCase() === address?.toLowerCase();
    });
  }, [allCustomTokens, address]);

  const serverPortfolioQuery = useWalletPortfolio({
    addresses: address ? [address] : [],
    enabled: !!address && !(addressType === 'solana' && mode === 'testnet'),
    mode: mode,
  });

  const serverPortfolio = useMemo(() => {
    return serverPortfolioQuery.data ?? [];
  }, [serverPortfolioQuery.data]);

  const hasServerData = serverPortfolio.length > 0;

  const serverAssetIdSet = useMemo(() => {
    return new Set(serverPortfolio.map((bt) => bt.assetId));
  }, [serverPortfolio]);

  const serverNativeChainSet = useMemo(() => {
    return new Set(
      serverPortfolio
        .filter((bt) => bt.type === 'TOKEN_TYPE_NATIVE')
        .map((bt) => bt.assetId.split('/')[0])
    );
  }, [serverPortfolio]);

  const nativeTokenRpcQueries = useQueries({
    queries: activeChains.map((chain) => {
      const caip = getChainCaip(chain);
      const nativeExistsInServer = serverNativeChainSet.has(caip);
      return {
        queryKey: ['token-balances', 'native-fallback', caip, address, mode],
        queryFn: () =>
          ApiClient.rpcTokenBalancesBatch([chain], address || '', []),
        enabled:
          !!address &&
          (!hasServerData || !!chain.is_testnet || !nativeExistsInServer),
        staleTime: 30_000,
        refetchInterval: 60_000,
        placeholderData: keepPreviousData,
      };
    }),
  });

  const customTokenRpcQueries = useQueries({
    queries: customTokens.map((token: CustomToken) => {
      const chain = activeChains.find((c) => {
        const caip = getChainCaip(c);
        return token.assetId.startsWith(`${caip}/`);
      });

      return {
        queryKey: ['token-balances', 'custom', token.assetId, address, mode],
        queryFn: () =>
          chain
            ? ApiClient.rpcTokenBalancesBatch([chain], address || '', [token])
            : Promise.resolve({}),
        enabled: !!address && !!chain,
        staleTime: 30_000,
        refetchInterval: 60_000,
        placeholderData: keepPreviousData,
      };
    }),
  });

  const rpcBalanceMap = useMemo(() => {
    const combined: Record<string | number, any> = {};
    nativeTokenRpcQueries.forEach((q) => {
      if (q.data) Object.assign(combined, q.data);
    });
    customTokenRpcQueries.forEach((q) => {
      if (q.data) Object.assign(combined, q.data);
    });
    return combined;
  }, [nativeTokenRpcQueries, customTokenRpcQueries]);

  const missingPriceTokenIds = useMemo(() => {
    const ids = new Set<string>();

    activeChains.forEach((c) => {
      const caip = getChainCaip(c);
      if (!serverNativeChainSet.has(caip)) {
        ids.add(caip);
      }
    });

    customTokens.forEach((ct: CustomToken) => {
      if (!serverAssetIdSet.has(ct.assetId)) {
        ids.add(ct.assetId);
      }
    });

    return Array.from(ids).sort();
  }, [activeChains, customTokens, serverAssetIdSet, serverNativeChainSet]);

  const marketPriceQuery = useQuery({
    queryKey: ['token-prices', 'unified', missingPriceTokenIds.join(','), mode],
    queryFn: () => {
      const nativeChainIds: string[] = [];
      const tokenEntries: { assetId: string; address: string }[] = [];

      for (const assetId of missingPriceTokenIds) {
        const parts = assetId.split('/');
        if (parts.length === 1 || parts[1]?.startsWith('slip44:')) {
          nativeChainIds.push(parts[0]);
        } else {
          const address = parts[1]?.split(':').slice(1).join(':') || '';
          tokenEntries.push({ assetId, address });
        }
      }

      return ApiClient.defillamaGetPriceFungible({
        nativeChainIds,
        tokens: tokenEntries,
      });
    },
    enabled: missingPriceTokenIds.length > 0 && !serverPortfolioQuery.isLoading,
    staleTime: 30_000,
    refetchInterval: 60_000,
    placeholderData: keepPreviousData,
  });

  const marketPriceData = marketPriceQuery.data || {};

  const chainIds = useMemo(
    () => activeChains.map((c) => getChainCaip(c)),
    [activeChains]
  );

  useEffect(() => {
    const nativePrices: Record<string, number> = {};

    if (hasServerData) {
      serverPortfolio.forEach((bt) => {
        if (bt.type === 'TOKEN_TYPE_NATIVE' && bt.priceUsd) {
          const chainId = (bt.assetId || '').split('/')[0];
          if (chainId) nativePrices[chainId] = bt.priceUsd;
        }
      });
    }

    if (marketPriceQuery.data) {
      for (const chainId of chainIds) {
        if (!nativePrices[chainId] && marketPriceQuery.data[chainId]) {
          nativePrices[chainId] = marketPriceQuery.data[chainId].price;
        }
      }
    }
  }, [hasServerData, serverPortfolio, marketPriceQuery.data, chainIds]);

  const activeChainIds = useMemo(() => {
    return new Set(
      activeChains.map((c) => (getChainCaip(c) || '').toLowerCase())
    );
  }, [activeChains]);

  const allTokens = useMemo(() => {
    const map = new Map<string, SanitizedPortfolio>();

    if (hasServerData) {
      serverPortfolio.forEach((bt) => {
        const parsed = parseCaip19(bt.assetId);
        if (!parsed) return;

        const caip = parsed.caip.toLowerCase();
        if (!activeChainIds.has(caip)) return;

        const mapKey =
          bt.type === 'TOKEN_TYPE_NATIVE'
            ? caip
            : (bt.assetId || '').toLowerCase();

        map.set(mapKey, {
          ...bt,
          valueUsd: (bt.priceUsd || 0) * Number(bt.amount),
        });
      });
    }

    activeChains.forEach((chain) => {
      const caip = getChainCaip(chain);
      const tokenKey = (caip || '').toLowerCase();
      if (map.has(tokenKey)) return;

      const balance = rpcBalanceMap?.[caip];
      const price = marketPriceData[caip]?.price || 0;
      const priceChange = marketPriceData[caip]?.priceChange || 0;
      const token = buildNativeToken(chain, balance, { price, priceChange });

      map.set(tokenKey, token);
    });

    customTokens.forEach((ct: CustomToken) => {
      const chainId = (ct.assetId || '').split('/')[0].toLowerCase();
      if (!activeChainIds.has(chainId)) return;

      const balance = rpcBalanceMap?.[ct.assetId];
      const price = marketPriceData[ct.assetId]?.price || 0;
      const priceChange = marketPriceData[ct.assetId]?.priceChange || 0;
      const token = buildCustomToken(
        ct,
        balance,
        { price, priceChange },
        mode === 'testnet'
      );

      map.set((token.assetId || '').toLowerCase(), token);
    });

    return Array.from(map.values());
  }, [
    activeChains,
    hasServerData,
    serverPortfolio,
    rpcBalanceMap,
    customTokens,
    marketPriceData,
    activeChainIds,
  ]);

  const isLoading = serverPortfolioQuery.isLoading || isNetworksLoading;

  const visibleTokens = useMemo(
    () => allTokens.filter((t) => !t.hidden),
    [allTokens]
  );

  const hiddenTokens = useMemo(
    () => allTokens.filter((t) => t.hidden),
    [allTokens]
  );

  const { mutate: crawlImages } = useCrawlTokenImages();
  useEffect(() => {
    if (isLoading || !address) return;
    crawlImages({ walletAddress: address });
  }, [isLoading, address, crawlImages]);

  return {
    data: visibleTokens,
    hiddenTokens,
    isLoading,
    isError: serverPortfolioQuery.isError || marketPriceQuery.isError,
  };
}
