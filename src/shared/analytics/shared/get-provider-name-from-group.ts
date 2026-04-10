import type { Brand } from '@/shared/type-utils/brand';
import { isAccountContainer } from '@/shared/types/validators';
import type { WalletGroup } from '@/shared/types/wallet-group';
import { capitalize } from 'capitalize-ts';

type AccountProviderName = Brand<string, 'AccountProviderName'>;

enum AccountProvider {
  younoExtension = 'younoExtension',
  viewerNotAdded = 'viewerNotAdded',
  readOnly = 'readOnly',
}

export function getProviderNameFromGroup(
  group: WalletGroup | null
): AccountProvider | AccountProviderName {
  return group
    ? isAccountContainer(group.walletContainer)
      ? (group.walletContainer.provider as AccountProviderName) ??
        AccountProvider.readOnly
      : AccountProvider.younoExtension
    : AccountProvider.viewerNotAdded;
}

export function getProviderForApiV4(
  provider: AccountProvider | AccountProviderName
) {
  switch (provider) {
    case AccountProvider.viewerNotAdded: {
      return 'viewer_not_added';
    }
    case AccountProvider.younoExtension: {
      return 'youno-extension';
    }
    case AccountProvider.readOnly: {
      return 'Read Only';
    }
    default: {
      return provider;
    }
  }
}

export function getProviderForMetabase(
  provider: AccountProvider | AccountProviderName
) {
  switch (provider) {
    case AccountProvider.viewerNotAdded: {
      return 'viewer_not_added';
    }
    case AccountProvider.younoExtension: {
      return 'Youno Wallet';
    }
    case AccountProvider.readOnly: {
      return 'Read only'; // matching with ios event
    }
    default: {
      return capitalize(provider);
    }
  }
}

export const getProviderForMixpanel = getProviderForMetabase;
