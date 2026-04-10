import { valueToHex } from '@/shared/units/value-to-hex';
import type { IncomingTransaction } from '../types/IncomingTransaction';
import { ChainIdValue } from './chainId-value';

export function getChainId(transaction: IncomingTransaction) {
  const { chainId } = transaction;
  return chainId ? valueToHex(chainId) : ChainIdValue.Mainnet;
}
