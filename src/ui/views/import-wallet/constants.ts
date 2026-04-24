export const IMPORT_ROUTES = {
  ROOT: '/import-wallet',
  MNEMONIC: '/import-wallet/mnemonic',
  HARDWARE: '/import-wallet/hardware',
  READONLY: '/import-wallet/readonly',
  PRIVATE_KEY: '/import-wallet/private-key',
  SECRET: '/import-wallet/secret',
} as const;

export const MNEMONIC_STEPS = {
  VERIFY: 'verify',
  DISCOVERY: 'discovery',
} as const;

export const PRIVATE_KEY_STEPS = {
  VERIFY: 'verify',
} as const;

export const SHARED_IMPORT_STEPS = {
  SUCCESS: 'success',
} as const;
