import { HDNode } from '@ethersproject/hdnode';
import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { fromSolanaKeypair } from 'src/modules/solana/keypairs';
import type {
  BareWallet,
  MaskedBareWallet,
} from 'src/shared/types/bare-wallet';
import type { DerivationPathType } from 'src/shared/wallet/derivation-paths';
import {
  getAccountPath,
  getAccountPathEthereum,
} from 'src/shared/wallet/derivation-paths';
import type { LocallyEncoded } from 'src/shared/wallet/encode-locally';
import {
  decodeMasked,
  encodeForMasking,
} from 'src/shared/wallet/encode-locally';

export interface Params {
  /**
   * 'ecdsa' is used to create ethereum key pairs;
   * 'ed25519' is used to create solana key pairs;
   */
  curve: 'ecdsa' | 'ed25519';
  phrase: LocallyEncoded;
  pathType?: DerivationPathType;
  n: number;
}

export type Result = MaskedBareWallet[];

function locallyMaskWallet(wallet: BareWallet | HDNode) {
  return {
    mnemonic: wallet.mnemonic
      ? { ...wallet.mnemonic, phrase: encodeForMasking(wallet.mnemonic.phrase) }
      : null,
    privateKey: encodeForMasking(wallet.privateKey),
    address: wallet.address,
    name: 'name' in wallet ? wallet.name ?? null : null,
  };
}

function fromHDNode(hdNode: HDNode): MaskedBareWallet {
  if (!hdNode.mnemonic) {
    throw new Error('Expected an HDNode with a mnemonic');
  }
  return locallyMaskWallet(hdNode);
}

/** Ethereum keypairs */
function mnemonicNDerivationEcdsa({ phrase, n }: Omit<Params, 'curve'>) {
  const result: Result = [];
  // NOTE:
  // ethers.utils.HDNode is _much_ faster at generating wallets
  // than ethers.Wallet
  const hd = HDNode.fromMnemonic(decodeMasked(phrase));
  for (let i = 0; i < n; i++) {
    const path = getAccountPathEthereum(i);
    const wallet = hd.derivePath(path);
    result.push(fromHDNode(wallet));
  }
  return result;
}

/** Solana keypairs */
function mnemonicNDerivationEd25519({
  phrase: phraseEncoded,
  n,
  pathType = 'solanaBip44Change',
}: Omit<Params, 'curve'>) {
  const result: Result = [];
  const phrase = decodeMasked(phraseEncoded);
  const seed = bip39.mnemonicToSeedSync(phrase);
  for (let i = 0; i < n; i++) {
    const path = getAccountPath(pathType, i);
    const { key: derivedSeed } = derivePath(path, seed.toString('hex'));
    const keypair = Keypair.fromSeed(derivedSeed);
    const wallet = fromSolanaKeypair({ mnemonic: { phrase, path }, keypair });
    result.push(locallyMaskWallet(wallet));
  }
  return result;
}

function main(params: Params) {
  if (params.curve === 'ed25519') {
    // TODO: measure performance time
    return mnemonicNDerivationEd25519(params);
  } else if (params.curve === 'ecdsa') {
    return mnemonicNDerivationEcdsa(params);
  } else {
    throw new Error(`Must pass known curve type: ${params.curve}`);
  }
}

global.onmessage = (event: MessageEvent<Params>) => {
  const result = main(event.data);
  global.postMessage(result);
};
