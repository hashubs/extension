import { walletPort } from '@/shared/channel';
import { emitter } from '@/shared/events';

export async function setCurrentNetworkId({ networkId }: { networkId: string | null }) {
  return walletPort.request('setCurrentNetworkId', { networkId }).then((result) => {
    emitter.emit('uiNetworkChanged');
    return result;
  });
}
