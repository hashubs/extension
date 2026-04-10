import type { IdentifierString } from '@wallet-standard/base';
import { Transaction, VersionedTransaction } from '@solana/web3.js';

/** Solana Mainnet (beta) cluster, e.g. https://api.mainnet-beta.solana.com */
export const SOLANA_MAINNET_CHAIN = 'solana:mainnet';

/** Solana Devnet cluster, e.g. https://api.devnet.solana.com */
export const SOLANA_DEVNET_CHAIN = 'solana:devnet';

/** Solana Testnet cluster, e.g. https://api.testnet.solana.com */
export const SOLANA_TESTNET_CHAIN = 'solana:testnet';

/** Solana Localnet cluster, e.g. http://localhost:8899 */
export const SOLANA_LOCALNET_CHAIN = 'solana:localnet';

/** Array of all Solana clusters */
export const SOLANA_CHAINS = [
  SOLANA_MAINNET_CHAIN,
  SOLANA_DEVNET_CHAIN,
  SOLANA_TESTNET_CHAIN,
  SOLANA_LOCALNET_CHAIN,
] as const;

/** Type of all Solana clusters */
export type SolanaChain = (typeof SOLANA_CHAINS)[number];

/**
 * Check if a chain corresponds with one of the Solana clusters.
 */
export function isSolanaChain(chain: IdentifierString): chain is SolanaChain {
  return (SOLANA_CHAINS as readonly string[]).includes(chain);
}

export function isVersionedTransaction(
  transaction: Transaction | VersionedTransaction
): transaction is VersionedTransaction {
  return 'version' in transaction;
}

// Minimal base58 implementation for signatures (same as in original package)
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const ALPHABET_MAP: number[] = new Array(256).fill(255);
for (let i = 0; i < ALPHABET.length; i++) {
  ALPHABET_MAP[ALPHABET.charCodeAt(i)] = i;
}

export const base58Sign = {
  encode(source: Uint8Array): string {
    if (source.length === 0) return '';
    const digits = [0];
    for (let i = 0; i < source.length; i++) {
      let carry = source[i];
      for (let j = 0; j < digits.length; j++) {
        carry += digits[j] << 8;
        digits[j] = carry % 58;
        carry = (carry / 58) | 0;
      }
      while (carry > 0) {
        digits.push(carry % 58);
        carry = (carry / 58) | 0;
      }
    }
    let string = '';
    for (let i = 0; i < source.length && source[i] === 0; i++) {
      string += ALPHABET[0];
    }
    for (let i = digits.length - 1; i >= 0; i--) {
      string += ALPHABET[digits[i]];
    }
    return string;
  },
  decode(string: string): Uint8Array {
    if (string.length === 0) return new Uint8Array(0);
    const bytes = [0];
    for (let i = 0; i < string.length; i++) {
      const charCode = string.charCodeAt(i);
      let carry = ALPHABET_MAP[charCode];
      if (carry === 255) throw new Error('Invalid base58 character');
      for (let j = 0; j < bytes.length; j++) {
        carry += bytes[j] * 58;
        bytes[j] = carry & 0xff;
        carry >>= 8;
      }
      while (carry > 0) {
        bytes.push(carry & 0xff);
        carry >>= 8;
      }
    }
    for (let i = 0; i < string.length && string[i] === ALPHABET[0]; i++) {
      bytes.push(0);
    }
    return new Uint8Array(bytes.reverse());
  },
};
