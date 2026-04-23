export const BACKUP_WALLET_ROUTES = {
  ROOT: '/backup-wallet',
  MNEMONIC: '/backup-wallet/mnemonic',
  VERIFY: '/backup-wallet/verify',
  SUCCESS: '/backup-wallet/success',
} as const;

export const BACKUP_WALLET_STEPS = {
  MNEMONIC: 'mnemonic',
  VERIFY: 'verify',
  SUCCESS: 'success',
} as const;
