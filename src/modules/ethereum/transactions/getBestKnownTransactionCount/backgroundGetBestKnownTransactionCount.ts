import { transactionService } from '@/background/transactions/transaction-service';
import { getBestKnownTransactionCount } from '../getTransactionCount';

export async function backgroundGetBestKnownTransactionCount(
  params: Parameters<typeof getBestKnownTransactionCount>[1]
) {
  const state = await transactionService.getTransactionsStore().getSavedState();
  return getBestKnownTransactionCount(state, params);
}
