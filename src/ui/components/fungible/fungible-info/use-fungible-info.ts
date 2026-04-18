import { parseCaip19 } from '@/shared/chains/parse-caip19';
import { FungibleInfo } from '@/shared/request/external/asset-get-fungible-info';
import { useIsTestnetMode } from '@/ui/features/preferences';
import { useFungibleInfo as useFungibleInfoRequest } from '@/ui/hooks/request/external/use-fungible-info';
import {
  useNativeTokenBalance,
  useSingleTokenBalance,
} from '@/ui/hooks/request/external/use-token-balance';
import { useAddressParams } from '@/ui/hooks/request/internal/useAddressParams';
import { useNetworks } from '@/ui/hooks/request/internal/useNetworks';
import { useMemo } from 'react';

export interface OptimisticFungibleInfo extends FungibleInfo {
  type: string;
  amount: {
    raw: string;
    amount: number;
    amountUsd: number;
  };
  market?: {
    price?: number | null;
    marketCap?: number | null;
    allTimeHigh?: number | null;
    allTimeLow?: number | null;
    totalVolume?: number | null;
    circulatingSupply?: number | null;
    dilutedMarketCap?: number | null;
    changePercent?: number | null;
  } | null;
}

export function useFungibleInfo(assetId: string) {
  const { singleAddress: currentAddress } = useAddressParams();
  const { networks } = useNetworks();

  const asset = parseCaip19(assetId);

  const chain = useMemo(() => {
    if (!networks || !asset?.chainId) return null;
    return networks.getChainByCaip(asset.caip);
  }, [networks, asset?.chainId]);

  const isNative = asset?.assetNamespace === 'slip44';

  const isTestnetMode = useIsTestnetMode();

  const { data: fungibleInfoData, isLoading: isFungibleInfoLoading } =
    useFungibleInfoRequest({
      id: assetId,
      enabled: !!assetId && !isTestnetMode,
    });

  const { data: tokenBalanceData, isLoading: isTokenLoading } =
    useSingleTokenBalance({
      tokenAddress: fungibleInfoData?.address,
      decimals: fungibleInfoData?.decimals,
      walletAddress: currentAddress,
      chainData: chain || undefined,
      enabled: !!currentAddress && !!chain && !isNative,
    });

  const { data: nativeBalanceData, isLoading: isNativeLoading } =
    useNativeTokenBalance({
      chainData: chain || undefined,
      walletAddress: currentAddress,
      enabled: !!currentAddress && !!chain && isNative,
    });

  const isBalanceLoading = isNative ? isNativeLoading : isTokenLoading;

  const fungibleInfo = useMemo((): OptimisticFungibleInfo | null => {
    if (!fungibleInfoData?.assetId || !chain) return null;

    const assetId = fungibleInfoData.assetId;
    const address = fungibleInfoData.address;

    const name =
      fungibleInfoData.name === 'slip44' ? chain.name : fungibleInfoData.name;
    const symbol =
      fungibleInfoData.symbol === 'slip44'
        ? chain.native_asset?.symbol || 'ETH'
        : fungibleInfoData.symbol;

    const logoUrl = fungibleInfoData?.metadata?.logoUrl || chain.icon_url || '';

    const description = fungibleInfoData?.metadata?.description || '';
    const website = fungibleInfoData?.metadata?.links?.website || '';
    const twitter = fungibleInfoData?.metadata?.links?.twitter || '';

    const fetchedAmount = isNative
      ? nativeBalanceData?.amount
      : tokenBalanceData?.amount;

    const fetchedAmountRaw = isNative
      ? nativeBalanceData?.raw
      : tokenBalanceData?.raw;

    const amount = fetchedAmount || 0;
    const amountRaw = fetchedAmountRaw || '0';
    const availableOn = fungibleInfoData?.metadata?.availableOn || [];
    const market = fungibleInfoData?.market ?? null;
    const price = fungibleInfoData?.market?.price ?? 0;
    const amountUsd = price * Number(amount);

    const type = isNative
      ? 'TOKEN_TYPE_NATIVE'
      : chain.standard === 'solana'
      ? 'TOKEN_TYPE_SPL'
      : 'TOKEN_TYPE_ERC20';

    return {
      id: fungibleInfoData?.id || assetId,
      assetId,
      chainId: Number(fungibleInfoData?.chainId) || 0,
      address,
      symbol,
      name,
      decimals: fungibleInfoData?.decimals || 0,
      verified: fungibleInfoData?.verified,
      type,
      metadata: {
        logoUrl,
        description,
        links: {
          twitter,
          website,
          discord: '',
        },
        availableOn,
      },
      amount: {
        raw: amountRaw,
        amount: Number(amount) || 0,
        amountUsd: Number(amountUsd) || 0,
      },
      market: market
        ? {
            price,
            marketCap: market.marketCap || undefined,
            allTimeHigh: market.allTimeHigh || undefined,
            allTimeLow: market.allTimeLow || undefined,
            totalVolume: market.totalVolume || undefined,
            circulatingSupply: market.circulatingSupply || undefined,
            dilutedMarketCap: market.dilutedMarketCap || undefined,
            changePercent: undefined,
          }
        : null,
    };
  }, [
    fungibleInfoData,
    chain,
    isNative,
    fungibleInfoData,
    nativeBalanceData,
    tokenBalanceData,
  ]);

  return {
    chain,
    fungibleInfo,
    isFungibleInfoLoading,
    isBalanceLoading,
  };
}
