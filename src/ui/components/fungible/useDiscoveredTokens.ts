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
import { useEffect, useMemo, useRef } from 'react';

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
    return allCustomTokens.filter(
      (token: CustomToken) =>
        token.accountAddress?.toLowerCase() === address?.toLowerCase()
    );
  }, [allCustomTokens, address]);

  const serverPortfolioQuery = useWalletPortfolio({
    addresses: address ? [address] : [],
    enabled: !!address && !(addressType === 'solana' && mode === 'testnet'),
    mode,
  });

  const serverPortfolio = useMemo(
    () => serverPortfolioQuery.data ?? [],
    [serverPortfolioQuery.data]
  );

  const hasServerData = serverPortfolio.length > 0;

  const serverAssetIdSet = useMemo(
    () => new Set(serverPortfolio.map((bt) => bt.assetId)),
    [serverPortfolio]
  );

  const serverNativeChainSet = useMemo(
    () =>
      new Set(
        serverPortfolio
          .filter((bt) => bt.type === 'TOKEN_TYPE_NATIVE')
          .map((bt) => bt.assetId.split('/')[0])
      ),
    [serverPortfolio]
  );

  const chainsNeedingRpc = useMemo(() => {
    return activeChains.filter((chain) => {
      const caip = getChainCaip(chain);
      return (
        !hasServerData || !!chain.is_testnet || !serverNativeChainSet.has(caip)
      );
    });
  }, [activeChains, hasServerData, serverNativeChainSet]);

  const nativeTokenRpcQueries = useQueries({
    queries: chainsNeedingRpc.map((chain) => {
      const caip = getChainCaip(chain);
      return {
        queryKey: ['token-balances', 'native-fallback', caip, address, mode],
        queryFn: () =>
          ApiClient.rpcTokenBalancesBatch([chain], address || '', []),
        enabled: !!address,
        staleTime: 30_000,
        refetchInterval: 60_000,
        placeholderData: keepPreviousData,
      };
    }),
  });

  const chainByCaipPrefix = useMemo(() => {
    const map = new Map<string, NetworkConfig>();
    activeChains.forEach((c) => {
      map.set(getChainCaip(c), c as NetworkConfig);
    });
    return map;
  }, [activeChains]);

  const customTokensNeedingRpc = useMemo(() => {
    return customTokens.filter(
      (token: CustomToken) => !serverAssetIdSet.has(token.assetId)
    );
  }, [customTokens, serverAssetIdSet]);

  const customTokenRpcQueries = useQueries({
    queries: customTokensNeedingRpc.map((token: CustomToken) => {
      const chainCaip = (token.assetId || '').split('/')[0];
      const chain = chainByCaipPrefix.get(chainCaip);

      return {
        queryKey: ['token-balances', 'custom', token.assetId, address, mode],
        queryFn: () =>
          chain
            ? ApiClient.rpcTokenBalancesBatch([chain as any], address || '', [
                token,
              ])
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

    chainsNeedingRpc.forEach((c) => {
      const caip = getChainCaip(c);
      if (!serverNativeChainSet.has(caip)) {
        ids.add(caip);
      }
    });

    customTokensNeedingRpc.forEach((ct: CustomToken) => {
      ids.add(ct.assetId);
    });

    return Array.from(ids).sort();
  }, [chainsNeedingRpc, customTokensNeedingRpc, serverNativeChainSet]);

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
          const addr = parts[1]?.split(':').slice(1).join(':') || '';
          tokenEntries.push({ assetId, address: addr });
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

  const activeChainIds = useMemo(
    () =>
      new Set(activeChains.map((c) => (getChainCaip(c) || '').toLowerCase())),
    [activeChains]
  );

  const allTokens = useMemo(() => {
    const map = new Map<string, SanitizedPortfolio>();

    if (hasServerData) {
      for (const bt of serverPortfolio) {
        const parsed = parseCaip19(bt.assetId);
        if (!parsed) continue;

        const caip = parsed.caip.toLowerCase();
        if (!activeChainIds.has(caip)) continue;

        const mapKey =
          bt.type === 'TOKEN_TYPE_NATIVE'
            ? caip
            : (bt.assetId || '').toLowerCase();

        map.set(mapKey, {
          ...bt,
          valueUsd: (bt.priceUsd || 0) * Number(bt.amount),
        });
      }
    }

    for (const chain of chainsNeedingRpc) {
      const caip = getChainCaip(chain);
      const tokenKey = (caip || '').toLowerCase();
      if (map.has(tokenKey)) continue;

      const balance = rpcBalanceMap?.[caip];
      const priceInfo = marketPriceData[caip];
      const token = buildNativeToken(chain, balance, {
        price: priceInfo?.price || 0,
        priceChange: priceInfo?.priceChange || 0,
      });

      map.set(tokenKey, token);
    }

    for (const ct of customTokens) {
      const chainId = (ct.assetId || '').split('/')[0].toLowerCase();
      if (!activeChainIds.has(chainId)) continue;

      const balance = rpcBalanceMap?.[ct.assetId];
      const priceInfo = marketPriceData[ct.assetId];
      const token = buildCustomToken(
        ct,
        balance,
        {
          price: priceInfo?.price || 0,
          priceChange: priceInfo?.priceChange || 0,
        },
        mode === 'testnet'
      );

      map.set((token.assetId || '').toLowerCase(), token);
    }

    return Array.from(map.values());
  }, [
    activeChainIds,
    chainsNeedingRpc,
    customTokens,
    hasServerData,
    marketPriceData,
    mode,
    rpcBalanceMap,
    serverPortfolio,
  ]);

  const { visibleTokens, hiddenTokens } = useMemo(() => {
    const visible: SanitizedPortfolio[] = [];
    const hidden: SanitizedPortfolio[] = [];
    for (const t of allTokens) {
      if (t.hidden) {
        hidden.push(t);
      } else {
        visible.push(t);
      }
    }
    return { visibleTokens: visible, hiddenTokens: hidden };
  }, [allTokens]);

  const { mutate: crawlImages } = useCrawlTokenImages();
  const crawlCalledRef = useRef(false);

  useEffect(() => {
    if (isNetworksLoading || serverPortfolioQuery.isLoading || !address) return;
    if (crawlCalledRef.current) return;
    crawlCalledRef.current = true;
    crawlImages({ walletAddress: address });
  }, [isNetworksLoading, serverPortfolioQuery.isLoading, address, crawlImages]);

  useEffect(() => {
    crawlCalledRef.current = false;
  }, [address]);

  const isLoading = serverPortfolioQuery.isLoading || isNetworksLoading;

  return {
    data: visibleTokens,
    hiddenTokens,
    isLoading,
    isError: serverPortfolioQuery.isError || marketPriceQuery.isError,
  };
}
