import { INTERNAL_SYMBOL_CONTEXT } from '@/background/wallet/wallet';
import {
  getProviderForApiV4,
  getProviderNameFromGroup,
} from '@/shared/analytics/shared/get-provider-name-from-group';
import type { Wallet } from '@/shared/types/wallet';

export async function getAddressProviderHeader(
  wallet: Wallet,
  address: string
) {
  const group = await wallet.getWalletGroupByAddress({
    params: { address },
    context: INTERNAL_SYMBOL_CONTEXT,
  });
  return getProviderForApiV4(getProviderNameFromGroup(group));
}
