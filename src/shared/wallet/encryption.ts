import type { SessionCredentials } from '@/background/account/credentials';
import { decryptObject } from '@/modules/crypto/aes';
import { stableDecryptObject } from '@/modules/crypto/aesStable';
import { getSHA256HexDigest } from '@/modules/crypto/get-sha256-hex-digest';
import type { Encrypted, StableEncrypted } from '@/modules/crypto/types';
import { isValidMnemonic } from '@/shared/validation/wallet';

export function decryptMnemonic(data: string, credentials: SessionCredentials) {
  const encrypted = JSON.parse(data) as Encrypted | StableEncrypted;
  if ('iv' in encrypted) {
    return decryptObject<string>(
      credentials.seedPhraseEncryptionKey,
      encrypted
    );
  } else {
    return stableDecryptObject<string>(
      credentials.seedPhraseEncryptionKey_deprecated,
      encrypted
    );
  }
}

export function isEncryptedMnemonic(phrase: string) {
  // consider any non-valid mnemonic string to be encrypted
  return !isValidMnemonic(phrase);
}

export async function seedPhraseToHash(phrase: string) {
  /**
   * Storing hash of the seed phrase is considered ok, because using a brute-force search
   * to find phrase by hash makes little sense: you could brute-force phrases to get actual
   * private keys or addresses instead.
   *
   * * We add a version to the output hash to be able to update hashing algorithm later
   * * We mix in an additional non BIP-32 word to the input, even though hashing an unmodified seed phrase should be safe given the above
   */
  const VERSION = '1';
  const NON_BIP_32_WORD = 'synthwave';
  const message = `${NON_BIP_32_WORD}${phrase}`;
  const hash = await getSHA256HexDigest(message);
  return `${VERSION}:${hash}`;
}
