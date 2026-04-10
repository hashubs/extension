import type { SerializableTransactionResponse } from '@/modules/ethereum/types/transaction-response-plain';
import type { SolSignTransactionResult } from '@/modules/solana/transactions/SolTransactionResponse';
import type { OneOf } from '../type-utils/OneOf';

export type SignTransactionResult = OneOf<{
  evm: SerializableTransactionResponse;
  solana: SolSignTransactionResult | SolSignTransactionResult[];
}>;
