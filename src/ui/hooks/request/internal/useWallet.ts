import { pushUnique, removeFromArray } from '@/shared/array-mutations';
import { walletPort } from '@/shared/channel';
import { invariant } from '@/shared/invariant';
import { checkForTestAddress } from '@/shared/meta-app-state';
import { normalizeAddress } from '@/shared/normalize-address';
import {
  getWalletNameFlagsByOrigin,
  isMetamaskModeOn,
} from '@/shared/preferences-helpers';
import { queryClient } from '@/shared/query-client/queryClient';
import {
  isHardwareContainer,
  isMnemonicContainer,
  isSignerContainer,
} from '@/shared/types/validators';
import { WalletGroup } from '@/shared/types/wallet-group';
import type { WalletNameFlag } from '@/shared/types/wallet-name-flag';
import { wait } from '@/shared/wait';
import { useGlobalPreferences } from '@/ui/features/preferences/usePreferences';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { produce } from 'immer';
import { useEffect, useMemo } from 'react';
import { useEvent } from '../../useEvent';

export const QUERY_WALLET = {
  lastUsedAddress: (userId?: string) => ['wallet/getLastUsedAddress', userId],
  currentAddress: ['wallet/getCurrentAddress'],
  currentWallet: ['wallet/uiGetCurrentWallet'],
  walletGroups: ['wallet/uiGetWalletGroups'],
  walletGroup: (groupId?: string) => ['wallet/uiGetWalletGroup', groupId],
  walletByAddress: (address: string, groupId: string) => [
    'wallet/uiGetWalletByAddress',
    address,
    groupId,
  ],
} as const;

export function useWalletAddresses() {
  const { data: walletGroups, ...query } = useWalletGroups();

  const addresses = useMemo(() => {
    if (!walletGroups) {
      return null;
    }
    const result: string[] = [];
    for (const group of walletGroups) {
      for (const wallet of group.walletContainer.wallets) {
        result.push(wallet.address);
      }
    }
    return result;
  }, [walletGroups]);

  return { data: addresses, ...query };
}

export function getLastUsedAddress(userId: string | undefined) {
  return useQuery({
    enabled: Boolean(userId),
    queryKey: QUERY_WALLET.lastUsedAddress(userId),
    queryFn: async () => {
      await wait(500);
      invariant(userId, 'userId is required');
      return walletPort.request('getLastUsedAddress', { userId });
    },
  });
}

export function getCurrentWallet() {
  return useQuery({
    queryKey: QUERY_WALLET.currentWallet,
    queryFn: async () => {
      return walletPort.request('uiGetCurrentWallet');
    },
  });
}

interface AddressParams {
  params: { address: string };
  singleAddressNormalized: string;
  singleAddress: string;
  maybeSingleAddress: string | null;
  ready: boolean;
  isLoading: boolean;
  refetch: () => void;
}

const queryFnCurrentAddress = () =>
  walletPort.request('getCurrentAddress').then((result) => result || null);

export function readCachedCurrentAddress() {
  return queryClient.getQueryData<
    Awaited<ReturnType<typeof queryFnCurrentAddress>>
  >(QUERY_WALLET.currentAddress);
}

export function useAddressParams(): AddressParams {
  const {
    data: addressResult,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: QUERY_WALLET.currentAddress,
    queryFn: queryFnCurrentAddress,
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

export function useAllExistingMnemonicAddresses() {
  const { data: walletGroups } = useQuery({
    queryKey: QUERY_WALLET.walletGroups,
    queryFn: () => walletPort.request('uiGetWalletGroups'),
    staleTime: 30000,
  });
  return useMemo(
    () =>
      walletGroups
        ?.filter((group) => isMnemonicContainer(group.walletContainer))
        ?.flatMap((group) => group.walletContainer.wallets)
        .map(({ address }) => normalizeAddress(address)),
    [walletGroups]
  );
}

export function useAllSignerOrHwAddresses() {
  const { data: walletGroups } = useQuery({
    queryKey: QUERY_WALLET.walletGroups,
    queryFn: () => walletPort.request('uiGetWalletGroups'),
    staleTime: 30000,
  });
  return useMemo(
    () =>
      walletGroups
        ?.filter(
          (group) =>
            isSignerContainer(group.walletContainer) ||
            isHardwareContainer(group.walletContainer)
        )
        ?.flatMap((group) => group.walletContainer.wallets)
        .map(({ address }) => normalizeAddress(address)),
    [walletGroups]
  );
}

export function useWalletNameFlags(tabOrigin?: string) {
  const { globalPreferences, query, mutation } = useGlobalPreferences();

  const setWalletNameFlags = useMutation({
    mutationFn: async ({
      flag,
      checked,
    }: {
      flag: WalletNameFlag;
      checked: boolean;
    }) => {
      const updatedPreferences = produce(globalPreferences, (draft) => {
        if (!draft || !tabOrigin) {
          return;
        }
        const value = draft.walletNameFlags[tabOrigin];
        if (checked) {
          if (value) {
            pushUnique(value, flag);
          } else {
            draft.walletNameFlags[tabOrigin] = [flag];
          }
        } else {
          if (value) {
            removeFromArray(value, flag);
          } else {
            draft.walletNameFlags[tabOrigin] = [];
          }
        }
      });
      if (updatedPreferences) {
        return mutation.mutateAsync(updatedPreferences);
      }
    },
  });

  const walletNameFlags =
    globalPreferences && tabOrigin
      ? getWalletNameFlagsByOrigin(globalPreferences, tabOrigin)
      : null;

  const isMetaMask = walletNameFlags
    ? isMetamaskModeOn(walletNameFlags)
    : false;

  return {
    walletNameFlags,
    isLoading: query.isLoading,
    setWalletNameFlags,
    isMetaMask,
  };
}

export function useWalletByAddress({
  address,
  groupId,
}: {
  address: string;
  groupId: string;
}) {
  return useQuery({
    queryKey: QUERY_WALLET.walletByAddress(address, groupId),
    queryFn: () =>
      walletPort.request('uiGetWalletByAddress', { address, groupId }),
    staleTime: 1000 * 60 * 5,
  });
}

export function useWalletGroups() {
  return useQuery({
    queryKey: QUERY_WALLET.walletGroups,
    queryFn: () => walletPort.request('uiGetWalletGroups'),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });
}

export function usePrefetchWalletGroups() {
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: QUERY_WALLET.walletGroups,
      queryFn: () => walletPort.request('uiGetWalletGroups'),
      staleTime: 1000 * 60 * 5,
    });
  }, []);
}

export function useWalletGroupByGroupId({ groupId }: { groupId: string }) {
  return useQuery({
    queryKey: QUERY_WALLET.walletGroup(groupId),
    queryFn: () => walletPort.request('uiGetWalletGroup', { groupId }),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });
}

export function useWalletGroupsByGroupId(options: { enabled?: boolean } = {}) {
  const onSuccess = useEvent((groups: WalletGroup[] | null) => {
    requestIdleCallback(() => {
      checkForTestAddress(groups);
    });
  });
  return useQuery({
    queryKey: QUERY_WALLET.walletGroups,
    queryFn: async () => {
      const result = await walletPort.request('uiGetWalletGroups');
      onSuccess(result);
      return result;
    },
    enabled: options.enabled,
  });
}

export function usePrefetchWalletGroupDetails(
  walletGroups?: WalletGroup[] | null
) {
  useEffect(() => {
    if (walletGroups) {
      walletGroups.forEach((group) => {
        queryClient.prefetchQuery({
          queryKey: QUERY_WALLET.walletGroup(group.id),
          queryFn: () =>
            walletPort.request('uiGetWalletGroup', { groupId: group.id }),
          staleTime: 1000 * 60 * 5,
        });
      });
    }
  }, [walletGroups, queryClient]);
}
