import { walletPort } from '@/shared/channel';
import { getPreferences } from '@/ui/features/preferences/usePreferences';
import { NetworksStore } from './networks-store';

export const mainNetworksStore = new NetworksStore(
  { networks: null },
  {
    getOtherNetworkData: async () => {
      return walletPort.request('getOtherNetworkData') as any;
    },
    testnetMode: false,
  }
);

export const testenvNetworksStore = new NetworksStore(
  { networks: null },
  {
    getOtherNetworkData: async () => {
      return walletPort.request('getOtherNetworkData') as any;
    },
    testnetMode: true,
  }
);

export async function getNetworksStore() {
  const preferences = await getPreferences();
  return preferences.testnetMode?.on ? testenvNetworksStore : mainNetworksStore;
}
