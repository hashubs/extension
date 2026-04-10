import { WalletAccount, WalletIcon } from '@wallet-standard/base';
import { SOLANA_CHAINS } from './solana';

const SOLANA_FEATURES = [
  'solana:signAndSendTransaction',
  'solana:signTransaction',
  'solana:signMessage',
] as const;

export class YounoWalletAccount implements WalletAccount {
  readonly #address: string;
  readonly #publicKey: Uint8Array;
  readonly #label?: string;
  readonly #icon?: WalletIcon;

  constructor({
    address,
    publicKey,
    label,
    icon,
  }: Omit<WalletAccount, 'chains' | 'features'>) {
    if (new.target === YounoWalletAccount) {
      Object.freeze(this);
    }
    this.#address = address;
    this.#publicKey = new Uint8Array(publicKey);
    this.#label = label;
    this.#icon = icon;
  }

  get address() {
    return this.#address;
  }

  get publicKey() {
    return this.#publicKey.slice();
  }

  get chains() {
    return SOLANA_CHAINS.slice();
  }

  get features() {
    return SOLANA_FEATURES.slice();
  }

  get label() {
    return this.#label;
  }

  get icon() {
    return this.#icon;
  }
}
