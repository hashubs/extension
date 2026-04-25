import { walletPort } from '@/shared/channels';
import { emitter } from '@/shared/events';

export async function setCurrentAddress({ address }: { address: string }) {
  return walletPort.request('setCurrentAddress', { address }).then((result) => {
    emitter.emit('uiAccountsChanged');
    return result;
  });
}
