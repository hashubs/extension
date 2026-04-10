import type { TransactionObject } from '@/modules/ethereum/transactions/types';
import { normalizeAddress } from '@/shared/normalize-address';

export type AddressParams =
  | {
      address: string;
    }
  | {
      addresses: string[];
    };

interface MultipleAddressesParam {
  addresses: string[];
}

function isMultipleAddressesParam(
  x: AddressParams
): x is MultipleAddressesParam {
  return 'addresses' in x;
}

export function filterAddressTransactions(
  addressParams: AddressParams,
  transactions: TransactionObject[]
) {
  return transactions.filter((tx) => {
    const txFromRaw = tx.transaction ? tx.transaction.from : tx.publicKey;
    if (!txFromRaw) {
      return false;
    }
    const txFrom = normalizeAddress(txFromRaw);
    if (isMultipleAddressesParam(addressParams)) {
      return addressParams.addresses.includes(txFrom);
    } else {
      return txFrom === normalizeAddress(addressParams.address);
    }
  });
}
