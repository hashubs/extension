import { getPendingTransactions } from '@/modules/ethereum/transactions/model';
import { useStore } from '@store-unit/react';
import { localTransactionsStore } from './transactions-store';

export function usePendingTransactions() {
  const localTransactions = useStore(localTransactionsStore);
  return getPendingTransactions(localTransactions);
}
