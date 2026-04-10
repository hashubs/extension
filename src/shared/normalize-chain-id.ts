import type { ChainId } from '@/modules/ethereum/transactions/chainId';
import type { BigNumber } from '@ethersproject/bignumber';
import { valueToHex } from './units/value-to-hex';

export function normalizeChainId(
  value: string | number | bigint | BigNumber
): ChainId {
  return valueToHex(value).toLowerCase() as ChainId;
}
