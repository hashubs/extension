import { describe, it, expect } from '@jest/globals';
import { maskWallet } from '@/background/wallet/helpers/mask';
import { BareWallet } from '@/background/wallet/model/bare-wallet';

describe('Wallet Masking', () => {
  it('should mask privateKey and mnemonic phrase in BareWallet', () => {
    const rawWallet: BareWallet = {
      address: '0x123',
      name: 'Test Wallet',
      privateKey: 'secret-key',
      mnemonic: {
        phrase: 'word1 word2 ...',
        path: "m/44'/60'/0'/0/0"
      },
    };

    const masked = maskWallet(rawWallet);
    console.log('MASKED MNEMONIC:', JSON.stringify(masked.mnemonic, null, 2));
    
    expect(masked.address).toBe('0x123');
    expect(masked.privateKey).toBe('<privateKey>');
    expect(masked.mnemonic?.phrase).toBe('<phrase>');
    expect(masked.mnemonic?.path).toBe("m/44'/60'/0'/0/0");
    
    // Original should be unchanged (Immer)
    expect(rawWallet.privateKey).toBe('secret-key');
  });

  it('should handle wallet without mnemonic', () => {
    const rawWallet: BareWallet = {
      address: '0x123',
      name: 'Test Wallet',
      privateKey: 'secret-key',
      mnemonic: null,
    };

    const masked = maskWallet(rawWallet);
    expect(masked.privateKey).toBe('<privateKey>');
    expect(masked.mnemonic).toBeNull();
  });
});
