import type { Account } from '@/background/account/account';
import { emitter } from '@/background/events';
import type { Wallet } from '@/shared/types/wallet';

export function handleAccountEvents({ account }: { account: Account }) {
  const disposers: Array<() => void> = [];
  const removeListeners = () => {
    disposers.forEach((cb) => cb());
    disposers.length = 0;
  };

  function addWalletEventListeners(wallet: Wallet) {
    disposers.push(
      wallet.emitter.on('recordUpdated', () => {
        emitter.emit('accountsChanged');
      }),
      wallet.emitter.on('currentAddressChange', () => {
        emitter.emit('accountsChanged');
      }),
      wallet.emitter.on('permissionsUpdated', () => {
        emitter.emit('accountsChanged');
      }),
      wallet.emitter.on('chainChanged', (chainId, origin) => {
        emitter.emit('chainChanged', chainId, origin);
        emitter.emit('chainsUpdated');
      })
    );
  }

  addWalletEventListeners(account.getCurrentWallet());

  account.on('authenticated', async () => {
    emitter.emit('accountsChanged');
    emitter.emit('chainsUpdated');
  });

  account.on('reset', () => {
    removeListeners();
    addWalletEventListeners(account.getCurrentWallet());
    emitter.emit('accountsChanged');
  });
}
