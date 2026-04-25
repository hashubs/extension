import { walletPort } from '@/shared/channels';

export function getWalletGroupByAddress(address: string) {
  return walletPort.request('getWalletGroupByAddress', { address });
}
