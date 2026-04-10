import type { LocallyEncoded } from '@/shared/wallet/encode-locally';

export interface SignerObject {
  mnemonic: { phrase: string; path: string } | null;
  privateKey: string;
}

export interface MaskedSignerObject {
  mnemonic: { phrase: LocallyEncoded; path: string } | null;
  privateKey: LocallyEncoded;
}
