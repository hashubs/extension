import { getTransactionObjectStatus } from '@/modules/ethereum/transactions/getTransactionObjectStatus';
import type { ActionStatus } from '@/shared/request/types/wallet-get-actions';
import { useStore } from '@store-unit/react';
import { useMemo } from 'react';
import { localTransactionsStore } from './transactions-store';

export function useTransactionStatus(hash: string | null) {
  const transactions = useStore(localTransactionsStore);
  return useMemo(() => {
    if (hash) {
      const tx = transactions.find((tx) => tx.hash === hash);
      return tx ? getTransactionObjectStatus(tx) : null;
    } else {
      return null;
    }
  }, [hash, transactions]);
}

export function waitForTransactionResolve(
  hash: string | null
): Promise<ActionStatus> {
  if (!hash) {
    return Promise.reject(
      new Error('Hash is required to wait for transaction resolve')
    );
  }
  return new Promise((resolve) => {
    const unsub = localTransactionsStore.on('change', (transactions) => {
      const tx = transactions.find((tx) => tx.hash === hash);
      if (tx) {
        const status = getTransactionObjectStatus(tx);
        if (status !== 'pending') {
          resolve(status);
          unsub();
          return;
        }
      }
    });
  });
}
