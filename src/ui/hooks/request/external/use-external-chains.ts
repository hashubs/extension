import type { NetworkConfig } from '@/modules/networks/network-config';
import { Networks } from '@/modules/networks/networks';
import { normalizeChainId } from '@/shared/normalize-chain-id';
import {
  type EVMChainDataResponse,
  fetchAllChains,
  isTestnet,
} from '@/shared/request/external/defillama-get-chains';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useRef, useState } from 'react';

const PAGE_SIZE = 50;

export type BrowseChainItem = {
  key: string;
  label: string;
  subLabel: string;
  imgUrl?: string;
  isSaved: boolean;
  data?: EVMChainDataResponse;
  network?: any;
};

export function useExternalChains(
  networks: Networks | null,
  testnetMode: boolean
) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const handleSetQuery = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(value);
      setVisibleCount(PAGE_SIZE);
    }, 300);
  }, []);

  // Fetch all chains for search (registry)
  const { data: allRegistryChains = [], isLoading: isRegistryLoading } =
    useQuery<EVMChainDataResponse[]>({
      queryKey: ['external-chains-large'],
      queryFn: () => fetchAllChains(5000),
      staleTime: 60 * 60 * 1000,
    });

  const savedChainIds = useMemo(() => {
    if (!networks) return new Set<string>();
    return new Set(
      networks
        .getNetworks()
        .filter(Networks.isEip155)
        .map((n: NetworkConfig) => {
          try {
            return Networks.getChainId(n);
          } catch {
            return null;
          }
        })
        .filter(Boolean)
    );
  }, [networks]);

  const filtered = useMemo(() => {
    if (!networks) return [];

    const lower = debouncedQuery.trim().toLowerCase();
    const isNum = !isNaN(Number(debouncedQuery));
    const numericQuery = Number(debouncedQuery);

    const filteredSaved = networks.getNetworks().filter((n: NetworkConfig) => {
      if (!lower) return false;
      return (
        n.name.toLowerCase().includes(lower) &&
        Boolean(n.is_testnet) === testnetMode
      );
    });

    const filteredRegistry = allRegistryChains.filter((c) => {
      if (testnetMode !== isTestnet(c)) return false;
      if (savedChainIds.has(normalizeChainId(c.chainId))) return false;
      if (!lower) return true;
      return (
        c.name.toLowerCase().includes(lower) ||
        (isNum && c.chainId === numericQuery) ||
        c.nativeCurrency?.symbol.toLowerCase().includes(lower)
      );
    });

    const savedMapped: BrowseChainItem[] = filteredSaved.map(
      (n: NetworkConfig) => ({
        key: n.id,
        label: n.name,
        subLabel: n.native_asset?.symbol || 'Network',
        imgUrl: n.icon_url ?? undefined,
        isSaved: true,
        network: n,
      })
    );

    const registryMapped: BrowseChainItem[] = filteredRegistry.map((c) => ({
      key: `registry-${c.chainId}`,
      label: c.name,
      subLabel: `${c.nativeCurrency?.symbol} (Chain ID: ${c.chainId})`,
      imgUrl: undefined,
      isSaved: false,
      data: c,
    }));

    return [...savedMapped, ...registryMapped];
  }, [debouncedQuery, allRegistryChains, networks, testnetMode, savedChainIds]);

  const displayed = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount]
  );

  const hasMore = visibleCount < filtered.length;

  const loadMore = useCallback(() => {
    if (hasMore) {
      setVisibleCount((prev) => prev + PAGE_SIZE);
    }
  }, [hasMore]);

  return {
    query,
    setQuery: handleSetQuery,
    displayed,
    totalFiltered: filtered.length,
    isLoading: isRegistryLoading,
    hasMore,
    loadMore,
  };
}
