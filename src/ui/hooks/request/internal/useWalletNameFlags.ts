import { pushUnique, removeFromArray } from '@/shared/array-mutations';
import {
  getWalletNameFlagsByOrigin,
  isMetamaskModeOn,
} from '@/shared/preferences-helpers';
import type { WalletNameFlag } from '@/shared/types/wallet-name-flag';
import { useGlobalPreferences } from '@/ui/features/preferences/usePreferences';
import { useMutation } from '@tanstack/react-query';
import { produce } from 'immer';

export function useWalletNameFlags(tabOrigin?: string) {
  const { globalPreferences, query, mutation } = useGlobalPreferences();

  const setWalletNameFlags = useMutation({
    mutationFn: async ({
      flag,
      checked,
    }: {
      flag: WalletNameFlag;
      checked: boolean;
    }) => {
      const updatedPreferences = produce(globalPreferences, (draft) => {
        if (!draft || !tabOrigin) {
          return;
        }
        const value = draft.walletNameFlags[tabOrigin];
        if (checked) {
          if (value) {
            pushUnique(value, flag);
          } else {
            draft.walletNameFlags[tabOrigin] = [flag];
          }
        } else {
          if (value) {
            removeFromArray(value, flag);
          } else {
            draft.walletNameFlags[tabOrigin] = [];
          }
        }
      });
      if (updatedPreferences) {
        return mutation.mutateAsync(updatedPreferences);
      }
    },
  });

  const walletNameFlags =
    globalPreferences && tabOrigin
      ? getWalletNameFlagsByOrigin(globalPreferences, tabOrigin)
      : null;

  const isMetaMask = walletNameFlags
    ? isMetamaskModeOn(walletNameFlags)
    : false;

  return {
    walletNameFlags,
    isLoading: query.isLoading,
    setWalletNameFlags,
    isMetaMask,
  };
}
