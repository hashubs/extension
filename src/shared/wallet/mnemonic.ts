import * as bip39 from 'bip39';

/**
 * Generates a fresh 128-bit mnemonic (12 words).
 */
export function generateMnemonic(): string {
  return bip39.generateMnemonic(128); // 128 bits = 12 words
}

/**
 * Validates whether a string is a valid BIP-39 mnemonic.
 */
export function validateMnemonic(phrase: string): boolean {
  return bip39.validateMnemonic(phrase);
}
