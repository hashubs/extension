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
    if (isValidPrivateKey(recoveryInput)) {
      return { valid: true, message: '' };
    } else {
      return { valid: false, message: 'Invalid private key' };
    }
  }
}
