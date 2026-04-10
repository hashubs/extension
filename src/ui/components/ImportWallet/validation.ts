import { FEATURE_SOLANA } from '@/env/config';
import { isSolanaPrivateKey } from '@/modules/solana/shared';
import { isValidMnemonic, isValidPrivateKey } from '@/shared/validation/wallet';

export interface ValidationResult {
  valid: boolean;
  message: string;
}

export function validateMnemonicOrPrivateKey({
  recoveryInput,
}: {
  recoveryInput: string;
}): ValidationResult {
  if (recoveryInput.trim().split(/\s+/).length > 1) {
    // probably a mnemonic
    if (isValidMnemonic(recoveryInput)) {
      return { valid: true, message: '' };
    } else {
      return { valid: false, message: 'Invalid recovery phrase' };
    }
  } else {
    if (FEATURE_SOLANA !== 'on' && isSolanaPrivateKey(recoveryInput)) {
      return { valid: false, message: 'Solana support is coming soon' };
    }
    if (isValidPrivateKey(recoveryInput)) {
      return { valid: true, message: '' };
    } else {
      return { valid: false, message: 'Invalid private key' };
    }
  }
}
