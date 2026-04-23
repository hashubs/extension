export const ADD_WALLET_ROUTES = {
  ROOT: '/add-wallet',
  SCAN: '/add-wallet/scan',
  DISCOVERY: '/add-wallet/discovery',
  SUCCESS: '/add-wallet/success',
} as const;

export const ADD_WALLET_STEPS = {
  SCAN: 'scan',
  DISCOVERY: 'discovery',
  SUCCESS: 'success',
} as const;
