import { normalizeAddress } from '@/shared/normalize-address';
import type { Upgrades } from '@/shared/type-utils/versions';
import type {
  WalletRecord,
  WalletRecordVersion1,
  WalletRecordVersion2,
  WalletRecordVersion3,
  WalletRecordVersion4,
  WalletRecordVersion5,
} from './types';

type PossibleEntry =
  | WalletRecordVersion1
  | WalletRecordVersion2
  | WalletRecordVersion3
  | WalletRecordVersion4
  | WalletRecordVersion5
  | WalletRecord;

function mapObject<V, NewValue>(
  object: Record<string, V>,
  callbackFn: (params: [string, V]) => [string, NewValue]
) {
  return Object.fromEntries(Object.entries<V>(object).map(callbackFn));
}

/**
 * Term "upgrade" taken from dexie:
 * https://dexie.org/docs/Dexie/Dexie.version()
 * https://dexie.org/docs/Version/Version.upgrade()
 */
export const walletRecordUpgrades: Upgrades<PossibleEntry> = {
  2: (entry) => {
    return {
      ...entry,
      version: 2,
      preferences: {}, // reset preferences because shape is changed in version: 2
      permissions: mapObject(entry.permissions, ([key, value]) => [
        key,
        { addresses: typeof value === 'string' ? [value] : (value as string[]) },
      ]),
    } as WalletRecordVersion2;
  },
  3: (entry) => {
    const e = entry as WalletRecordVersion2;
    return {
      version: 3,
      transactions: e.transactions,
      walletManager: e.walletManager,
      permissions: e.permissions,
      publicPreferences: e.preferences,
    } as WalletRecordVersion3;
  },
  4: (entry) => {
    // WalletFeed type was removed
    return { ...entry, version: 4, feed: {} } as WalletRecordVersion4;
  },
  5: (entry) => {
    const e = entry as WalletRecordVersion4;
    return {
      ...e,
      version: 5,
      permissions: mapObject(e.permissions, ([key, value]) => {
        const addresses = value.addresses.map((address) =>
          normalizeAddress(address)
        );
        return [key, { ...value, addresses }];
      }),
    } as WalletRecordVersion5;
  },
  6: (entry) => {
    return { ...entry, version: 6, activityRecord: {} } as WalletRecord;
  },
};
