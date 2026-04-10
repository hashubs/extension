import type { StringBase64 } from '@/shared/types/string-base64';

interface SignResult {
  signature: string;
  publicKey: string;
  tx: StringBase64;
}

export type SolSignTransactionResult = SignResult;
