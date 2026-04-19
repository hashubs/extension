import { getChainCaip, parseCaip19 } from '@/modules/networks/helpers';
import { NetworkConfig } from '@/modules/networks/network-config';
import { getNativeTokenLogo } from '@/shared/chains/chain-logos';
import { DEFAULT_EVM_SLIP44, SYMBOL_TO_SLIP44 } from '@/shared/chains/slip44';
import { PriceResult } from '@/shared/request/external/defillama-get-price-fungible';
import { getR2TokenUrl } from '../get-r2-url';
import type { SanitizedPortfolio } from './sanitize-portfolio';
import { CustomToken } from './types';

/**
 * Generates a CAIP-19 asset ID for a native token.
 * Example: eip155:1/slip44:60, solana:mainnet/slip44:501
 */
export function getNativeAssetId(chain: NetworkConfig): string {
  const symbol = chain.native_asset?.symbol.toUpperCase() || '';
  const isSolana = chain.standard === 'solana';
  const slip44 =
    SYMBOL_TO_SLIP44[symbol] ?? (isSolana ? 501 : DEFAULT_EVM_SLIP44);
  const caip = getChainCaip(chain);
  return `${caip}/slip44:${slip44}`;
}

export function buildNativeToken(
  chain: NetworkConfig,
  balance?: { raw: string; amount: number },
  market?: PriceResult
): SanitizedPortfolio {
  const isSolana = chain.standard === 'solana';
  const symbol = chain.native_asset?.symbol;
  const decimals = chain.native_asset?.decimals;
  const tokenLogoUrl = getNativeTokenLogo(symbol ?? '');
  const assetId = getNativeAssetId(chain);
  const parse = parseCaip19(assetId);

  const chainId = isSolana ? 'solana' : parse?.chainId.toString() ?? '';
  const amount = balance?.amount ?? 0;
  const rawAmount = balance?.raw ?? '0';
  const price = market?.price ?? 0;
  const priceChange = market?.priceChange ?? 0;
  const valueUsd = price * amount;

  return {
    id: assetId,
    assetId: assetId,
    chainId: chainId,
    address: 'native',
    symbol: symbol ?? 'U',
    decimals: decimals ?? 18,
    name: chain.native_asset?.name || 'Unknown',
    type: 'TOKEN_TYPE_NATIVE',
    logoUrl: tokenLogoUrl,
    amount: amount.toString(),
    rawAmount: rawAmount,
    priceUsd: price,
    priceChange: priceChange,
    valueUsd: valueUsd,
    hidden: false,
  };
}

interface CustomTokenBalance {
  raw: string;
  amount: number;
}

export function buildCustomToken(
  ct: CustomToken,
  balance?: CustomTokenBalance,
  priceInfo?: PriceResult,
  isTestnet?: boolean
): SanitizedPortfolio {
  const price = priceInfo?.price ?? 0;
  const amount = balance?.amount ?? 0;

  const parse = parseCaip19(ct.assetId);
  const chainId = parse?.chainId.toString() ?? '';

  const logoUrl = getR2TokenUrl(chainId, ct.address);

  return {
    id: ct.assetId,
    assetId: ct.assetId,
    chainId: chainId,
    address: ct.address,
    symbol: ct.symbol,
    decimals: ct.decimals,
    name: ct.name,
    type: ct.ecosystem === 'SOLANA' ? 'TOKEN_TYPE_SPL' : 'TOKEN_TYPE_ERC20',
    logoUrl: isTestnet ? '' : logoUrl,
    amount: `${balance?.amount ?? 0}`,
    rawAmount: balance?.raw ?? '0',
    priceUsd: price,
    priceChange: priceInfo?.priceChange ?? 0,
    valueUsd: price * amount,
    hidden: false,
  };
}

export function buildFromServerBalance(
  bt: SanitizedPortfolio,
  isTestnet?: boolean
): SanitizedPortfolio {
  const parse = parseCaip19(bt.assetId!);
  const chainId = parse?.chainId.toString() ?? '';

  const isNative = bt.type === 'TOKEN_TYPE_NATIVE';
  const nativeLogoUrl = getNativeTokenLogo(bt.symbol);
  const logoUrl = isNative ? nativeLogoUrl : getR2TokenUrl(chainId, bt.address);

  return {
    id: bt.id,
    assetId: bt.assetId,
    chainId: chainId,
    address: bt.address,
    name: bt.name,
    symbol: bt.symbol,
    decimals: bt.decimals,
    type: bt.type,
    logoUrl: isTestnet ? '' : logoUrl,
    amount: bt.amount,
    rawAmount: bt.rawAmount,
    priceUsd: bt.priceUsd,
    priceChange: bt.priceChange,
    valueUsd: bt.valueUsd,
    hidden: bt.hidden,
  };
}
