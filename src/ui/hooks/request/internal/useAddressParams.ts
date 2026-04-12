import { walletPort } from '@/shared/channel';
import { normalizeAddress } from '@/shared/normalize-address';
import { queryClient } from '@/shared/query-client/queryClient';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

interface Result {
  params: { address: string };
  singleAddressNormalized: string;
  singleAddress: string;
  maybeSingleAddress: string | null;
  ready: boolean;
  isLoading: boolean;
  refetch: () => void;
}

const QUERY_KEY = ['wallet/getCurrentAddress'];

const queryFn = () =>
  walletPort.request('getCurrentAddress').then((result) => result || null);

export function readCachedCurrentAddress() {
  return queryClient.getQueryData<Awaited<ReturnType<typeof queryFn>>>(
    QUERY_KEY
  );
}

export function useAddressParams(): Result {
  const {
    data: addressResult,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn,
  });
  const address = addressResult || '';
  const addressNormalized = normalizeAddress(address);
  return {
    params: useMemo(
      () => ({ address: addressNormalized }),
      [addressNormalized]
    ),
    singleAddressNormalized: addressNormalized,
    maybeSingleAddress: address || null,
    singleAddress: address,
    ready: Boolean(address),
    isLoading,
    refetch,
  };
}
