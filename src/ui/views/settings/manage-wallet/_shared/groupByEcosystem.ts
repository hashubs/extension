import { WalletGroup } from '@/shared/types/wallet-group';
import groupBy from 'lodash/groupBy';
import { getAddressType } from 'src/shared/wallet/classifiers';

export function groupByEcosystem(
  wallets: WalletGroup['walletContainer']['wallets']
) {
  return groupBy(wallets, (wallet) => getAddressType(wallet.address)) as Record<
    ReturnType<typeof getAddressType>,
    typeof wallets
  >;
}
