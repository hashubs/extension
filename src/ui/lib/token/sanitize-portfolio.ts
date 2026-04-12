import { Portfolio } from '@/shared/request/external/wallet-get-portfolio';

export interface SanitizedPortfolio {
  id: string;
  assetId: string;
  chainId: string;
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  logoUrl: string;
  amount: string;
  rawAmount: string;
  priceUsd: number;
  priceChange: number;
  valueUsd: number;
  isVerified?: boolean;
  hidden: boolean;
  type: 'TOKEN_TYPE_NATIVE' | 'TOKEN_TYPE_ERC20' | 'TOKEN_TYPE_SPL';
}

export function sanitizePortfolio(
  data: Partial<Portfolio>
): SanitizedPortfolio {
  return {
    id: data.id ?? '',
    assetId: data.assetId ?? '',
    chainId: data.chainId?.toString() ?? '',
    address: data.address ?? '',
    decimals: data.decimals ?? 0,
    symbol: data.symbol ?? '',
    name: data.name ?? '',
    logoUrl: '',
    amount: data.amount?.toString() ?? '',
    rawAmount: data.rawAmount?.toString() ?? '',
    priceUsd: Number(data.priceUsd) || 0,
    priceChange: Number(data.priceChange) || 0,
    valueUsd: Number(data.valueUsd) || 0,
    isVerified: data.isVerified ?? false,
    hidden: data.hidden ?? false,
    type: data.type!,
  };
}
