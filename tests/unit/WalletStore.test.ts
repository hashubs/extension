import { describe, it, expect, beforeEach } from '@jest/globals';
import { WalletStore } from '@/background/wallet/persistence';
import type { WalletRecord } from '@/background/wallet/wallet-record';
import { mockLocalStorage, setupStorageMocks } from '../test-utils';

describe('WalletStore', () => {
  const STORE_KEY = 'wallet';
  const PASSWORD = 'test-password';
  const ENCRYPTION_KEY = PASSWORD; // In this system, the password is used as the key for now
  
  const mockRecord: WalletRecord = {
    version: 1,
    walletManager: {
      groups: [],
      currentAddress: null,
      internalMnemonicGroupCounter: 0,
    },
    permissions: {},
  };

  beforeEach(async () => {
    setupStorageMocks();
    await mockLocalStorage.clear();
  });

  it('should save and read an encrypted record', async () => {
    const store = new WalletStore();
    await store.ready();

    await store.save('wallet-1', ENCRYPTION_KEY, mockRecord);
    
    // Reset store to simulate fresh load
    const freshStore = new WalletStore();
    await freshStore.ready();
    
    const record = await freshStore.read('wallet-1', { encryptionKey: ENCRYPTION_KEY });
    expect(record).toEqual(mockRecord);
  });

  it('should return null if reading non-existent record', async () => {
    const store = new WalletStore();
    await store.ready();
    
    const record = await store.read('non-existent', { encryptionKey: ENCRYPTION_KEY });
    expect(record).toBeNull();
  });

  it('should verify password correctly via check()', async () => {
    const store = new WalletStore();
    await store.ready();

    await store.save('wallet-1', ENCRYPTION_KEY, mockRecord);
    
    // Correct key
    const record = await store.check('wallet-1', ENCRYPTION_KEY);
    expect(record).toEqual(mockRecord);
    
    // Wrong key - should throw during decryption
    await expect(store.check('wallet-1', 'wrong-password')).rejects.toThrow();
  });

  it('should delete records', async () => {
    const store = new WalletStore();
    await store.ready();

    await store.save('wallet-1', ENCRYPTION_KEY, mockRecord);
    await store.save('wallet-2', ENCRYPTION_KEY, { ...mockRecord });
    
    store.deleteMany(['wallet-1']);
    
    // Give it a bit more time for persistence
    await new Promise((resolve) => setTimeout(resolve, 50));
    
    const state = await mockLocalStorage.get(STORE_KEY);
    // state is { [STORE_KEY]: { 'wallet-1': ..., 'wallet-2': ... } }
    const walletState = state[STORE_KEY];
    
    expect(walletState).toBeDefined();
    expect(walletState['wallet-1']).toBeUndefined();
    expect(walletState['wallet-2']).toBeDefined();
  });
});
