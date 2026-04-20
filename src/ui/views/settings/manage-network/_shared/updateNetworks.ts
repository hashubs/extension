import {
  mainNetworksStore,
  testenvNetworksStore,
} from '@/modules/networks/networks-store.client';

export function updateNetworks() {
  return Promise.all([
    mainNetworksStore.update(),
    testenvNetworksStore.update(),
  ]);
}
