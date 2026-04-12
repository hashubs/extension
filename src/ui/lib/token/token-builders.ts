import type { PriceResult } from '@/modules/api/request/defillama-get-price-fungible.ts';
import { getNativeTokenLogo } from '@/shared/chains/chain-logos';
import { parseCaip19 } from '@/shared/chains/parse-caip19';
import { DEFAULT_EVM_SLIP44, SYMBOL_TO_SLIP44 } from '@/shared/chains/slip44';
import type { CustomToken, UnifiedChainConfig } from '@/types';
import { getR2TokenUrl } from '../get-r2-url.ts';
import { type SanitizedPortfolio } from './sanitize-portfolio';

/**
 * Generates a CAIP-19 asset ID for a native token.
 * Example: eip155:1/slip44:60, solana:mainnet/slip44:501
 */
export function getNativeAssetId(chain: UnifiedChainConfig): string {
  const symbol = chain.nativeCurrency?.symbol?.toUpperCase() || '';
  const isSolana = 'cluster' in chain;
  const slip44 =
    SYMBOL_TO_SLIP44[symbol] ?? (isSolana ? 501 : DEFAULT_EVM_SLIP44);
  return `${chain.caip}/slip44:${slip44}`;
}

export function buildNativeToken(
  chain: UnifiedChainConfig,
  balance?: { raw: string; amount: number },
  market?: PriceResult
): SanitizedPortfolio {
  const isSolana = 'cluster' in chain;
  const symbol = chain.nativeCurrency?.symbol;
  const decimals = chain.nativeCurrency?.decimals;
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
    name: chain.nativeCurrency?.name || 'Unknown',
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
  priceInfo?: PriceResult
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
    logoUrl: logoUrl,
    amount: `${balance?.amount ?? 0}`,
    rawAmount: balance?.raw ?? '0',
    priceUsd: price,
    priceChange: priceInfo?.priceChange ?? 0,
    valueUsd: price * amount,
    hidden: false,
  };
}

interface PriceFallback {
  price: number;
  priceChange: number;
}

export function buildFromServerBalance(
  bt: SanitizedPortfolio,
  priceFallback?: PriceFallback
): SanitizedPortfolio {
  const parse = parseCaip19(bt.assetId!);
  const chainId = parse?.chainId.toString() ?? '';

  const isNative = bt.type === 'TOKEN_TYPE_NATIVE';
  const nativeLogoUrl = getNativeTokenLogo(bt.symbol);
  const logoUrl = isNative ? nativeLogoUrl : getR2TokenUrl(chainId, bt.address);

  const price = bt.priceUsd ?? priceFallback?.price ?? 0;
  const priceChange = bt.priceChange ?? priceFallback?.priceChange ?? 0;

  return {
    id: bt.id,
    assetId: bt.assetId,
    chainId: chainId,
    address: bt.address,
    name: bt.name,
    symbol: bt.symbol,
    decimals: bt.decimals,
    type: bt.type,
    logoUrl: logoUrl,
    amount: bt.amount,
    rawAmount: bt.rawAmount,
    priceUsd: price,
    priceChange: priceChange,
    valueUsd: bt.valueUsd,
    hidden: bt.hidden,
  };
}
