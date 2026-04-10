import { describe, it, expect, beforeEach } from '@jest/globals';
import { Wallet } from '@/background/wallet';
import { Credentials } from '@/background/account/Credentials';
import { setupStorageMocks } from '../test-utils';

describe('Wallet', () => {
  let mockCredentials: Credentials;

  beforeEach(() => {
    mockCredentials = {
      id: 'user-1',
      encryptionKey: 'enc-key',
      seedPhraseEncryptionKey: 'seed-enc-key',
      seedPhraseEncryptionKey_deprecated: {} as any
    } as Credentials;
    setupStorageMocks();
  });

  it('should initialize and reach ready state', async () => {
    const wallet = new Wallet('user-1', null);
    await wallet.ready();
    // If it doesn't throw, it's successful
  }, 15000);

 it('should generate mnemonic if authenticated', async () => {
    console.log('1. creating wallet');
    const wallet = new Wallet('user-1', mockCredentials);
    
    console.log('2. calling ready()');
    await wallet.ready();
    
    console.log('3. calling uiGenerateMnemonic');
    const wallets = await wallet.uiGenerateMnemonic({ 
      id: 1, 
      params: { ecosystems: ['evm' as any] } 
    });
    
    console.log('4. done', wallets);
  }, 15000);

  it('should throw when generating mnemonic if not authenticated', async () => {
    const wallet = new Wallet('user-1', null);
    await wallet.ready();

    await expect(wallet.uiGenerateMnemonic({ 
      id: 1, 
      params: { ecosystems: ['evm' as any] } 
    })).rejects.toThrow('Not authenticated: Missing seedPhraseEncryptionKey');
  });

  it('should save pending wallet to store', async () => {
    const wallet = new Wallet('user-1', mockCredentials);
    await wallet.ready();

    await wallet.uiGenerateMnemonic({ 
      id: 1, 
      params: { ecosystems: ['evm' as any] } 
    });

    await wallet.savePendingWallet();
    
    const record = wallet.getRecord();
    expect(record).toBeDefined();
    expect(record?.walletManager.groups.length).toBe(1);
  }, 15000);

  it('should verify credentials', async () => {
    // 1. Setup a saved record first
    const wallet = new Wallet('user-1', mockCredentials);
    await wallet.ready();
    await wallet.uiGenerateMnemonic({ id: 1, params: { ecosystems: ['evm' as any] } });
    await wallet.savePendingWallet();

    // 2. Verify with another instance
    const freshWallet = new Wallet('user-1', null);
    await freshWallet.verifyCredentials({
      id: 2,
      params: { id: 'user-1', encryptionKey: 'enc-key' }
    });
    // If it doesn't throw, it's successful
  }, 15000);
});
