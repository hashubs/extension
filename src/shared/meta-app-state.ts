import { isReadonlyContainer } from 'src/shared/types/validators';
import { Store } from 'store-unit';
import { normalizeAddress } from './normalize-address';
import { WalletGroup } from './types/wallet-group';

const testAddress = process.env.TEST_WALLET_ADDRESS as string;

interface State {
  hasTestWallet: boolean;
}

class MetaAppState extends Store<State> {
  updateState(state: Partial<State>) {
    this.setState((value) => ({ ...value, ...state }));
  }
}

export const metaAppState = new MetaAppState({
  hasTestWallet: false,
});

let timesChecked = 0;

export function checkForTestAddress(groups: WalletGroup[] | null) {
  if (timesChecked > 2) {
    return;
  }
  if (
    testAddress &&
    groups?.some(
      (group) =>
        group.walletContainer.wallets.some(
          (wallet) =>
            normalizeAddress(wallet.address) === normalizeAddress(testAddress)
        ) && !isReadonlyContainer(group.walletContainer)
    )
  ) {
    metaAppState.updateState({ hasTestWallet: true });
  }
  timesChecked++;
}
