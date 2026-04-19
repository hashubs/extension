import {
  SolanaSignAndSendTransactionFeature,
  SolanaSignAndSendTransactionMethod,
  SolanaSignInFeature,
  SolanaSignInMethod,
  SolanaSignMessageFeature,
  SolanaSignMessageMethod,
  SolanaSignTransactionFeature,
  SolanaSignTransactionMethod,
} from '@solana/wallet-standard-features';
import { VersionedTransaction } from '@solana/web3.js';
import { Wallet, WalletIcon } from '@wallet-standard/base';
import {
  StandardConnectFeature,
  StandardConnectMethod,
  StandardDisconnectFeature,
  StandardDisconnectMethod,
  StandardEventsFeature,
  StandardEventsOnMethod,
} from '@wallet-standard/features';
import type { SolanaProvider } from '../solana-provider';
import { WalletAccount } from './account';
import { base58Sign, isSolanaChain, SOLANA_CHAINS } from './solana';

export type SolanaImplementation = SolanaProvider;

export class SolanaWalletStandard implements Wallet {
  readonly #listeners: { [E in string]?: any[] } = {};
  readonly #version = '1.0.0' as const;
  readonly #name: string;
  readonly #icon: WalletIcon;
  #account: WalletAccount | null = null;
  readonly #implementation: SolanaImplementation;

  constructor(implementation: SolanaImplementation) {
    this.#name = implementation.name || 'Selvo';
    this.#icon = implementation.icon as WalletIcon;
    this.#implementation = implementation;

    if (new.target === SolanaWalletStandard) {
      Object.freeze(this);
    }

    implementation.on('connect', this.#onConnect);
    implementation.on('disconnect', this.#onDisconnect);
    implementation.on('accountChanged', this.#onAccountChanged);

    this.#onAccountChanged();
  }

  get version() {
    return this.#version;
  }

  get name() {
    return this.#name;
  }

  get icon() {
    return this.#icon;
  }

  get chains() {
    return SOLANA_CHAINS.slice();
  }

  get features(): StandardConnectFeature &
    StandardDisconnectFeature &
    StandardEventsFeature &
    SolanaSignAndSendTransactionFeature &
    SolanaSignTransactionFeature &
    SolanaSignMessageFeature &
    SolanaSignInFeature {
    return {
      'standard:connect': {
        version: '1.0.0',
        connect: this.#connect,
      },
      'standard:disconnect': {
        version: '1.0.0',
        disconnect: this.#disconnect,
      },
      'standard:events': {
        version: '1.0.0',
        on: this.#on,
      },
      'solana:signAndSendTransaction': {
        version: '1.0.0',
        supportedTransactionVersions: ['legacy', 0],
        signAndSendTransaction: this.#signAndSendTransaction,
      },
      'solana:signTransaction': {
        version: '1.0.0',
        supportedTransactionVersions: ['legacy', 0],
        signTransaction: this.#signTransaction,
      },
      'solana:signMessage': {
        version: '1.0.0',
        signMessage: this.#signMessage,
      },
      'solana:signIn': {
        version: '1.0.0',
        signIn: this.#signIn,
      },
    };
  }

  get accounts() {
    return this.#account ? [this.#account] : [];
  }

  #onConnect = () => {
    this.#onAccountChanged();
  };

  #onDisconnect = () => {
    if (this.#account) {
      this.#account = null;
      this.#emit('change', { accounts: this.accounts });
    }
  };

  #onAccountChanged = () => {
    const publicKey = this.#implementation.publicKey;
    if (publicKey) {
      const address = publicKey.toBase58();
      const bytes = publicKey.toBytes();
      if (
        !this.#account ||
        this.#account.address !== address ||
        !this.#compareUint8Arrays(this.#account.publicKey, bytes)
      ) {
        this.#account = new WalletAccount({
          address,
          publicKey: bytes,
        });
        this.#emit('change', { accounts: this.accounts });
      }
    } else {
      this.#onDisconnect();
    }
  };

  #compareUint8Arrays(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  #emit = (event: string, ...args: any[]) => {
    this.#listeners[event]?.forEach((listener) => listener(...args));
  };

  #on: StandardEventsOnMethod = (event: string, listener: any) => {
    this.#listeners[event]?.push(listener) ||
      (this.#listeners[event] = [listener]);
    return () => {
      this.#listeners[event] = this.#listeners[event]?.filter(
        (l) => l !== listener
      );
    };
  };

  #connect: StandardConnectMethod = async () => {
    // SolanaProvider's connect doesn't support onlyIfTrusted yet.
    if (!this.#account) {
      await this.#implementation.connect();
    }
    this.#onAccountChanged();
    return { accounts: this.accounts };
  };

  #disconnect: StandardDisconnectMethod = async () => {
    await this.#implementation.disconnect();
  };

  #signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (
    ...inputs
  ) => {
    if (!this.#account) throw new Error('Not connected');
    const outputs = [];
    for (const input of inputs) {
      if (input.account !== this.#account) throw new Error('Invalid account');
      if (!isSolanaChain(input.chain)) throw new Error('Invalid chain');

      const { transaction, options } = input;
      const { signature } = await this.#implementation.signAndSendTransaction(
        VersionedTransaction.deserialize(transaction),
        options
      );
      outputs.push({ signature: base58Sign.decode(signature) });
    }
    return outputs;
  };

  #signTransaction: SolanaSignTransactionMethod = async (...inputs) => {
    if (!this.#account) throw new Error('Not connected');
    const outputs = [];
    for (const input of inputs) {
      if (input.account !== this.#account) throw new Error('Invalid account');
      if (input.chain && !isSolanaChain(input.chain))
        throw new Error('Invalid chain');

      const { transaction } = input;
      const signedTransaction = (await this.#implementation.signTransaction(
        VersionedTransaction.deserialize(transaction)
      )) as any;

      const serialized =
        typeof signedTransaction.serialize === 'function'
          ? signedTransaction.serialize()
          : (signedTransaction as any).serialize({
              requireAllSignatures: false,
              verifySignatures: false,
            });

      outputs.push({ signedTransaction: new Uint8Array(serialized) });
    }
    return outputs;
  };

  #signMessage: SolanaSignMessageMethod = async (...inputs) => {
    if (!this.#account) throw new Error('Not connected');
    const outputs = [];
    for (const input of inputs) {
      if (input.account !== this.#account) throw new Error('Invalid account');
      const { message } = input;
      const { signature } = await this.#implementation.signMessage(message);
      outputs.push({ signedMessage: message, signature });
    }
    return outputs;
  };

  #signIn: SolanaSignInMethod = async (...inputs) => {
    const outputs = [];
    for (const input of inputs) {
      outputs.push(await this.#implementation.signIn(input));
    }
    return outputs;
  };
}
