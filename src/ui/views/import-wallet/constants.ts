export const IMPORT_ROUTES = {
  ROOT: '/import-wallet',
  MNEMONIC: '/import-wallet/mnemonic',
  HARDWARE: '/import-wallet/hardware',
  READONLY: '/import-wallet/readonly',
  PRIVATE_KEY: '/import-wallet/private-key',
} as const;

export const MNEMONIC_STEPS = {
  VERIFY: 'verify',
  SCAN: 'scan',
  DISCOVERY: 'discovery',
  SUCCESS: 'success',
} as const;
