import { normalizeChainId } from '@/shared/normalize-chain-id';
import type { IncomingTransaction } from '../types/IncomingTransaction';

export function normalizeTransactionChainId(transaction: IncomingTransaction) {
  return transaction.chainId ? normalizeChainId(transaction.chainId) : null;
}
