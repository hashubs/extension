import { isSolanaAddress } from '@/modules/solana/shared';
import { isEthereumAddress } from '../is-ethereum-address';

export const BLOCKCHAIN_TYPES = ['evm', 'solana'] as const;
export type BlockchainType = (typeof BLOCKCHAIN_TYPES)[number];

export function getAddressType(address: string): BlockchainType {
  if (isEthereumAddress(address)) {
    return 'evm';
  } else if (isSolanaAddress(address)) {
    return 'solana';
  } else {
    throw new Error(`Unexpected address type: ${address}`);
  }
}
export function isMatchForEcosystem(address: string, ecosystem: BlockchainType): boolean {
  if (ecosystem === 'evm') {
    return isEthereumAddress(address);
  } else if (ecosystem === 'solana') {
    return isSolanaAddress(address);
  }
  return false;
}
