import { describe, it, expect, beforeEach } from '@jest/globals';
import { WalletRecordModel, WalletRecord, WalletGroup } from '@/background/wallet/wallet-record';
import { WalletOrigin } from '@/background/wallet/model/wallet-origin';
import { setupStorageMocks } from '../test-utils';

// Mock MnemonicWalletContainer for createOrUpdateRecord testing
const mockWalletContainer = {
  getFirstWallet: () => ({ address: '0x123' }),
  wallets: [{ address: '0x123' }]
} as any;

describe('WalletRecordModel', () => {
  const PASSWORD = 'password123';
  
  const mockRecord: WalletRecord = {
    version: 1,
    walletManager: {
      groups: [],
      currentAddress: null,
      internalMnemonicGroupCounter: 0,
    },
    permissions: {},
  };

  beforeEach(() => {
    setupStorageMocks();
  });

  it('should encrypt and decrypt a record properly', async () => {
    const encrypted = await WalletRecordModel.encryptRecord(PASSWORD, mockRecord);
    expect(typeof encrypted).toBe('string');
    
    const decrypted = await WalletRecordModel.decryptRecord(PASSWORD, encrypted);
    expect(decrypted).toEqual(mockRecord);
  });

  it('should create a new record if provided with null', () => {
    const pendingWallet = {
      walletContainer: mockWalletContainer,
      origin: WalletOrigin.extension,
      groupId: null
    };
    
    const record = WalletRecordModel.createOrUpdateRecord(null, pendingWallet);
    
    expect(record.version).toBe(1);
    expect(record.walletManager.groups.length).toBe(1);
    expect(record.walletManager.currentAddress).toBe('0x123');
    expect(record.walletManager.internalMnemonicGroupCounter).toBe(1);
    expect(record.walletManager.groups[0].name).toBe('Wallet 1');
  });

  it('should update an existing record by adding a new group', () => {
    const firstGroup: WalletGroup = {
      id: 'g1',
      walletContainer: mockWalletContainer,
      name: 'Wallet 1',
      lastBackedUp: null,
      origin: WalletOrigin.extension,
      created: Date.now()
    };
    
    const existingRecord: WalletRecord = {
      version: 1,
      walletManager: {
        groups: [firstGroup],
        currentAddress: '0x123',
        internalMnemonicGroupCounter: 1
      },
      permissions: {}
    };
    
    const secondWalletContainer = {
       getFirstWallet: () => ({ address: '0x456' }),
    } as any;
    
    const pendingWallet = {
      walletContainer: secondWalletContainer,
      origin: WalletOrigin.extension,
      groupId: null
    };
    
    const updated = WalletRecordModel.createOrUpdateRecord(existingRecord, pendingWallet);
    
    expect(updated.walletManager.groups.length).toBe(2);
    expect(updated.walletManager.internalMnemonicGroupCounter).toBe(2);
    expect(updated.walletManager.groups[1].name).toBe('Wallet 2');
    expect(updated.walletManager.groups[0].id).toBe('g1'); // Ensure existing group preserved
  });
});
