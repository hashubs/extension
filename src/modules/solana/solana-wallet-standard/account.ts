import {
  WalletAccount as WalletAccountInterface,
  WalletIcon,
} from '@wallet-standard/base';
import { SOLANA_CHAINS } from './solana';

const SOLANA_FEATURES = [
  'solana:signAndSendTransaction',
  'solana:signTransaction',
  'solana:signMessage',
] as const;

export class WalletAccount implements WalletAccountInterface {
  readonly #address: string;
  readonly #publicKey: Uint8Array;
  readonly #label?: string;
  readonly #icon?: WalletIcon;

  constructor({
    address,
    publicKey,
    label,
    icon,
  }: Omit<WalletAccountInterface, 'chains' | 'features'>) {
    if (new.target === WalletAccount) {
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
