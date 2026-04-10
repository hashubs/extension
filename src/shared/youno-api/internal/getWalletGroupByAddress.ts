import { walletPort } from '@/shared/channel';

export function getWalletGroupByAddress(address: string) {
  return walletPort.request('getWalletGroupByAddress', { address });
}
