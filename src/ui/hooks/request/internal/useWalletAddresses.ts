import { walletPort } from '@/shared/channel';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

export function useWalletAddresses() {
  const { data: walletGroups, ...query } = useQuery({
    queryKey: ['wallet/uiGetWalletGroups'],
    queryFn: () => walletPort.request('uiGetWalletGroups'),
  });

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
