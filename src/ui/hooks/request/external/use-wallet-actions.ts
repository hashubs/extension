import { ApiClient } from '@/shared/request/api.client';
import { Response } from '@/shared/request/external/wallet-get-actions';
import { ActionType } from '@/shared/request/types/wallet-get-actions';
import {
  keepPreviousData,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import React from 'react';

interface UseWalletActivityParams {
  addresses: string[];
  chain?: string;
  fungibleId?: string;
  actionTypes?: ActionType[];
  assetTypes?: ('fungible' | 'nft')[];
  searchQuery?: string;
  initialCursor?: string;
  enabled?: boolean;
}

export function useWalletActions({
  addresses,
  chain,
  fungibleId,
  actionTypes,
  assetTypes,
  searchQuery,
  initialCursor,
  enabled = true,
}: UseWalletActivityParams) {
  const queryClient = useQueryClient();
  const queryKey = [
    'wallet/actions',
    addresses,
    chain,
    fungibleId,
    actionTypes,
    initialCursor,
    assetTypes,
    searchQuery,
  ];

  const firstRender = React.useRef(true);

  if (firstRender.current) {
    firstRender.current = false;
    const cachedData = queryClient.getQueryData(queryKey) as Response & {
      pages: any[];
      pageParams: any[];
    };
    if (cachedData?.pages?.length > 1) {
      queryClient.setQueryData(queryKey, {
        ...cachedData,
        pages: [cachedData.pages[0]],
        pageParams: [cachedData.pageParams[0]],
      });
    }
  }

  return useInfiniteQuery<Response>({
    queryKey,
    queryFn: ({ pageParam }) => {
      return ApiClient.walletGetActions({
        addresses: addresses.filter(Boolean),
        currency: 'usd',
        chain,
        cursor: (pageParam as string) || initialCursor,
        limit: 10,
        fungibleId,
        actionTypes,
        assetTypes,
        searchQuery,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta?.pagination?.cursor ?? undefined,
    enabled: enabled && addresses.length > 0,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}
