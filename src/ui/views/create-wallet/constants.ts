export const CREATE_WALLET_ROUTES = {
  ROOT: '/create-wallet',
  SELECT_ECOSYSTEM: '/create-wallet/select-ecosystem',
  SELECT_GROUP: '/create-wallet/select-group',
  VERIFY: '/create-wallet/verify',
  GENERATE: '/create-wallet/generate',
} as const;

export const CREATE_WALLET_STEPS = {
  SELECT_ECOSYSTEM: 'select-ecosystem',
  SELECT_GROUP: 'select-group',
  VERIFY: 'verify',
  GENERATE: 'generate',
} as const;
