import { YounoWallet } from './wallet';

export function initialize(implementation: any) {
  const wallet = new YounoWallet(implementation);
  const register = ({ register }: { register: (wallet: any) => void }) =>
    register(wallet);

  try {
    window.dispatchEvent(
      new CustomEvent('wallet-standard:register-wallet', {
        detail: register,
        bubbles: false,
        cancelable: false,
        composed: false,
      })
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      'wallet-standard:register-wallet event could not be dispatched',
      error
    );
  }

  try {
    window.addEventListener(
      'wallet-standard:app-ready',
      ({ detail }: any) => register(detail as { register: (wallet: any) => void })
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      'wallet-standard:app-ready event listener could not be added',
      error
    );
  }
}
