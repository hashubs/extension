import type { AnyAddressAction } from '@/modules/ethereum/transactions/addressAction';
import type { Fungible } from '@/shared/request/types/fungible';
import type {
  Collection,
  NFTPreview,
} from '@/shared/request/types/wallet-get-actions';
import { isTruthy } from 'is-truthy-ts';

function fungibleMatches(query: string, fungible: Fungible | null | undefined) {
  if (!fungible) {
    return false;
  }
  return [fungible.name, fungible.symbol, fungible.id]
    .filter(isTruthy)
    .map((s) => s.toLowerCase())
    .some((s) => s.includes(query));
}

function nftMatches(query: string, nft: NFTPreview | null | undefined) {
  if (!nft) {
    return false;
  }
  return [nft.metadata?.name, nft.contractAddress, nft.tokenId]
    .filter(isTruthy)
    .map((s) => s.toLowerCase())
    .some((s) => s.includes(query));
}

function collectionMatches(
  query: string,
  collection: Collection | null | undefined
) {
  if (!collection) {
    return false;
  }
  return [collection.name, collection.id]
    .filter(isTruthy)
    .map((s) => s.toLowerCase())
    .some((s) => s.includes(query));
}

function isMatchForQuery(query: string, action: AnyAddressAction) {
  if (
    action.type.displayValue.toLowerCase().includes(query) ||
    action.type.value.toLowerCase().includes(query)
  ) {
    return true;
  }
  if (action.status.includes(query)) {
    return true;
  }

  if (
    action.label?.contract?.address.includes(query) ||
    action.label?.wallet?.address.includes(query)
  ) {
    return true;
  }

  if (
    action.content?.transfers?.some(
      (transfer) =>
        fungibleMatches(query, transfer.fungible) ||
        nftMatches(query, transfer.nft)
    )
  ) {
    return true;
  }

  if (
    action.content?.approvals?.some(
      (approval) =>
        fungibleMatches(query, approval.fungible) ||
        nftMatches(query, approval.nft) ||
        collectionMatches(query, approval.collection)
    )
  ) {
    return true;
  }

  return false;
}

export function isMatchForAllWords(query: string, action: AnyAddressAction) {
  const words = query.toLowerCase().trim().split(/\s+/);
  return words.every((word) => isMatchForQuery(word, action));
}
