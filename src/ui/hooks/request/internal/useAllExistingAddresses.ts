import { walletPort } from '@/shared/channel';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { normalizeAddress } from 'src/shared/normalize-address';
import {
  isHardwareContainer,
  isMnemonicContainer,
  isSignerContainer,
} from 'src/shared/types/validators';

export function useAllExistingMnemonicAddresses() {
  const { data: walletGroups } = useQuery({
    queryKey: ['wallet/uiGetWalletGroups'],
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
    queryKey: ['wallet/uiGetWalletGroups'],
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
