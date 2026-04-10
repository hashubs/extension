import type { GlobalPreferences } from './types/global-preferences';
import { WalletNameFlag } from './types/wallet-name-flag';

type WalletNameFlagsValue = WalletNameFlag[] | 'no-value';

export function getWalletNameFlagsByOrigin(
  preferences: Required<GlobalPreferences>,
  origin: string
): WalletNameFlagsValue {
  return preferences.walletNameFlags[origin] || 'no-value';
}

export function isMetamaskModeOn(value: WalletNameFlagsValue) {
  if (value == 'no-value') {
    // value is not set
    return true; // turn on by default
  } else if (value.includes(WalletNameFlag.isMetaMask)) {
    return true;
  } else {
    return false;
  }
}
