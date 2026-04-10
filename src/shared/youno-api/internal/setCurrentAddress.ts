import { walletPort } from '@/shared/channel';
import { emitter } from '@/shared/events';

export async function setCurrentAddress({ address }: { address: string }) {
  return walletPort.request('setCurrentAddress', { address }).then((result) => {
    emitter.emit('uiAccountsChanged');
    return result;
  });
}
