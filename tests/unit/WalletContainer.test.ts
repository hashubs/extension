import { describe, it, expect, beforeEach } from '@jest/globals';
import { MnemonicWalletContainer } from '@/background/wallet/model/wallet-container';
import { SeedType } from '@/background/wallet/model/seed-type';
import { SessionCredentials } from '@/background/account/Credentials';
import { setupStorageMocks } from '../test-utils';

describe('MnemonicWalletContainer', () => {
  const mockCredentials = {
    id: 'user-1',
    encryptionKey: 'enc-key',
    seedPhraseEncryptionKey: 'seed-enc-key',
    seedPhraseEncryptionKey_deprecated: {} as any
  } as SessionCredentials;

  beforeEach(() => {
    setupStorageMocks();
  });

  it('should create a container with encrypted mnemonic', async () => {
    const ecosystems = ['evm'] as any;
    const container = await MnemonicWalletContainer.create({
      credentials: mockCredentials,
      ecosystems
    });

    expect(container.seedType).toBe(SeedType.mnemonic);
    expect(container.wallets.length).toBe(1);
    
    const phrase = container.wallets[0].mnemonic?.phrase;
    expect(phrase).toBeDefined();
    // It should be encrypted (not the raw mnemonic which usually has spaces and 12-24 words)
    expect(phrase).toContain('{"iv":'); 
  }, 15000);

  it('should generate a seed hash', async () => {
    const container = await MnemonicWalletContainer.create({
      credentials: mockCredentials,
      ecosystems: ['evm'] as any
    });

    expect(container.seedHash).toBeDefined();
    expect(typeof container.seedHash).toBe('string');
  }, 15000);

  it('should throw if no active password session', async () => {
    const invalidCredentials = {
       seedPhraseEncryptionKey: null,
       seedPhraseEncryptionKey_deprecated: null
    } as any;

    await expect(MnemonicWalletContainer.create({
      credentials: invalidCredentials,
      ecosystems: ['evm'] as any
    })).rejects.toThrow('Active password session required to create wallet');
  });
});
