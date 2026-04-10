import { ActionAsset } from '@/shared/types/defi/action-asset';
import { Asset } from '@/shared/types/defi/asset';
import { NFTAsset } from '@/shared/types/defi/nft-asset';

export function getFungibleAsset(asset?: ActionAsset) {
  if (
    asset &&
    'fungible' in asset &&
    asset?.fungible &&
    'asset_code' in asset.fungible
  ) {
    return asset.fungible as Asset;
  }
  return null;
}

export function getNftAsset(asset?: ActionAsset) {
  if (asset && 'nft' in asset && asset?.nft && 'asset_code' in asset.nft) {
    return asset.nft as NFTAsset;
  }
  return null;
}
