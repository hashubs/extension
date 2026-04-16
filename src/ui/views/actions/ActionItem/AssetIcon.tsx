import { Fungible } from '@/shared/request/types/fungible';
import type {
  Collection,
  NFTPreview,
} from '@/shared/request/types/wallet-get-actions';
import React, { type JSX } from 'react';
import { TokenIcon } from './TokenIcon';

export function AssetIcon({
  fungible,
  nft,
  collection,
  size,
  fallback = null,
}: {
  fungible: Fungible | null | undefined;
  nft: NFTPreview | null | undefined;
  collection: Collection | null | undefined;
  size: number;
  fallback: React.ReactNode;
}) {
  return fungible?.iconUrl ? (
    <TokenIcon size={size} src={fungible.iconUrl} symbol={fungible.symbol} />
  ) : nft?.metadata?.content?.imagePreviewUrl ? (
    <TokenIcon
      size={size}
      src={nft.metadata.content.imagePreviewUrl}
      style={{ borderRadius: 4 }}
      symbol={nft.metadata.name || nft.tokenId}
    />
  ) : collection?.iconUrl ? (
    <TokenIcon
      size={size}
      src={collection.iconUrl}
      symbol={collection.name || 'Collection'}
    />
  ) : (
    (fallback as JSX.Element)
  );
}
