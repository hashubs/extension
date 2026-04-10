import { describe, it, expect, beforeEach } from '@jest/globals';
import { encrypt, decrypt } from '@/modules/crypto/aes';
import { setupStorageMocks } from '../test-utils';

describe('Encryption (AES-GCM)', () => {
  const PASSWORD = 'test-password';
  const DATA = { hello: 'world', nested: { foo: 'bar' } };

  beforeEach(() => {
    setupStorageMocks();
  });

  it('should encrypt and decrypt correctly', async () => {
    const encrypted = await encrypt(PASSWORD, DATA);
    expect(typeof encrypted).toBe('string');
    
    // Check if it's a valid JSON containing IV, data, salt, version
    const parsed = JSON.parse(encrypted);
    expect(parsed).toHaveProperty('iv');
    expect(parsed).toHaveProperty('data');
    expect(parsed).toHaveProperty('salt');
    expect(parsed.version).toBe(1);

    const decrypted = await decrypt(PASSWORD, encrypted);
    expect(decrypted).toEqual(DATA);
  }, 15000);

  it('should throw error with wrong password', async () => {
    const encrypted = await encrypt(PASSWORD, DATA);
    await expect(decrypt('wrong-password', encrypted)).rejects.toThrow();
  }, 15000);

  it('should produce different ciphertext for same data (different IV/salt)', async () => {
    const enc1 = await encrypt(PASSWORD, DATA);
    const enc2 = await encrypt(PASSWORD, DATA);
    expect(enc1).not.toBe(enc2);
  }, 15000);
});
