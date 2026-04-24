import { ethers } from 'ethers';
import type { ChainId } from '@/modules/ethereum/transactions/chainId';

export function normalizeChainId(
  value: string | number | bigint | any
): ChainId {
  try {
    return ethers.toBeHex(ethers.toBigInt(value)).toLowerCase() as ChainId;
  } catch (error) {
    return String(value).toLowerCase() as ChainId;
  }
}
