import { describe, it, expect } from '@jest/globals';
import { generateWalletsForEcosystems, restoreBareWallet } from '@/shared/wallet/create';

describe('Blockchain Utilities', () => {
  it('should generate wallets for EVM', () => {
    const ecosystems = ['evm' as any];
    const wallets = generateWalletsForEcosystems(ecosystems);
    
    expect(wallets.length).toBe(1);
    expect(wallets[0].address).toMatch(/^0x/);
    expect(wallets[0].mnemonic).toBeDefined();
    expect(wallets[0].privateKey).toBeDefined();
  });

  it('should generate wallets for both EVM and Solana with same mnemonic', () => {
    const ecosystems = ['evm' as any, 'solana' as any];
    const wallets = generateWalletsForEcosystems(ecosystems);
    
    expect(wallets.length).toBe(2);
    // Should share the same mnemonic phrase
    expect(wallets[0].mnemonic?.phrase).toBe(wallets[1].mnemonic?.phrase);
    expect(wallets[0].address).toMatch(/^0x/);
    // Solana address is usually base58, doesn't start with 0x
    expect(wallets[1].address).not.toMatch(/^0x/);
  });

  it('should restore a wallet from a private key', () => {
    const privateKey = '0x0000000000000000000000000000000000000000000000000000000000000001';
    const restored = restoreBareWallet({ privateKey });
    
    expect(restored.address).toBe('0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf');
    expect(restored.privateKey).toBe(privateKey);
  });

  it('should restore a wallet from a mnemonic', () => {
    const mnemonic = {
      phrase: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
      path: "m/44'/60'/0'/0/0"
    };
    const restored = restoreBareWallet({ mnemonic });
    
    expect(restored.address).toBe('0x9858EfFD232B4033E47d90003D41EC34EcaEda94');
    expect(restored.mnemonic?.phrase).toBe(mnemonic.phrase);
  });
});
