import { invariant } from '@/shared/invariant';
import { normalizeAddress } from '@/shared/normalize-address';
import { normalizeChainId } from '@/shared/normalize-chain-id';
import type { ChainId } from './chainId';
import type { StoredTransactions } from './types';

export function getLatestLocallyKnownNonce({
  state,
  address,
  chainId,
}: {
  state: StoredTransactions;
  address: string;
  chainId: ChainId;
}): number {
  const transactions = state.filter(
    (tx) =>
      tx.hash &&
      normalizeAddress(tx.transaction.from) === normalizeAddress(address) &&
      normalizeChainId(tx.transaction.chainId) === chainId
  );
  const nonces = transactions.map((tx) => {
    invariant(tx.hash, 'Evm item is expected');
    return Number(tx.transaction.nonce);
  });
  return Math.max(...nonces);
}
