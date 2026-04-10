import { describe, it, expect } from '@jest/globals';
import { normalizeAddress } from '@/shared/normalize-address';

describe('Address Normalization', () => {
  it('should checksum a valid lowercase EVM address', () => {
    const input = '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae';
    const expected = '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe';
    expect(normalizeAddress(input)).toBe(expected);
  });

  it('should handle already checksummed addresses', () => {
    const input = '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe';
    expect(normalizeAddress(input)).toBe(input);
  });

  it('should lowercase non-checksummable strings (e.g., Solana addresses or arbitrary IDs)', () => {
    const input = 'SOLANA_ADDRESS_EXAMPLE';
    const expected = 'solana_address_example';
    expect(normalizeAddress(input)).toBe(expected);
  });

  it('should handle empty or invalid inputs gracefully', () => {
    expect(normalizeAddress('')).toBe('');
    expect(normalizeAddress('0x123')).toBe('0x123'); // Too short for checksum
  });
});
