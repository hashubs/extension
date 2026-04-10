import type { ExternallyOwnedAccount } from './account-container';
import type { MaskedSignerObject, SignerObject } from './signer-object';

// TODO: rename BareWallet to SignerWallet?
export interface BareWallet extends ExternallyOwnedAccount, SignerObject {}
export interface BareMnemonicWallet extends BareWallet {
  mnemonic: NonNullable<SignerObject['mnemonic']>;
}

export interface MaskedBareWallet
  extends ExternallyOwnedAccount,
    MaskedSignerObject {}
