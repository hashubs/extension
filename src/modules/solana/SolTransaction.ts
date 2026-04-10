import type { StringBase64 } from '@/shared/types/string-base64';
import type { Transaction, VersionedTransaction } from '@solana/web3.js';

export { Transaction as SolanaTransactionLegacy } from '@solana/web3.js';
export type SolTransaction = Transaction | VersionedTransaction;

export type SolTxSerializable = StringBase64;
