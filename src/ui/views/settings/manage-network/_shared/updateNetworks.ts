import {
  mainNetworksStore,
  testenvNetworksStore,
} from '@/modules/networks/networks-store.client';

export async function updateNetworks() {
  await Promise.all([
    mainNetworksStore.update(),
    testenvNetworksStore.update(),
  ]);
}
