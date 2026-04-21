import {
  formatDefiLlamaPoints,
  formatFungibleChartPoints,
} from '@/modules/chart/formatter';
import { ApiClient } from '@/shared/request/api.client';
import { ChartPeriod } from '@/shared/request/external/asset-get-fungible-chart';
import {
  AssetChartPoint,
  FungibleChart,
} from '@/ui/components/fungible/chart-fungible/types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAddressParams } from '../internal/useWallet';

const PERIOD_TO_DEFILLAMA: Record<ChartPeriod, string> = {
  '1h': 'HOUR',
  '1d': 'DAY',
  '1w': 'WEEK',
  '1m': 'MONTH',
  '1y': 'YEAR',
  max: 'MAX',
};

interface ChartParams {
  id?: string;
  address: string;
  period: ChartPeriod;
  enabled?: boolean;
}

export function useFungibleChart({
  id,
  address,
  period,
  enabled = true,
}: ChartParams): {
  chartPoints: AssetChartPoint[];
  isLoading: boolean;
  isFetching: boolean;
} {
  const isSelvo = id?.includes('asset_');
  const duration = PERIOD_TO_DEFILLAMA[period];

  const { singleAddress: currentAddress } = useAddressParams();

  const query = useQuery({
    queryKey: [
      'asset/fungible-chart',
      id,
      period,
      currentAddress,
      isSelvo ? 'selvo' : 'llama',
    ],
    queryFn: async () => {
      if (!id) return null;

      if (isSelvo) {
        const res = await ApiClient.assetGetFungibleChart({
          addresses: [currentAddress],
          fungibleId: id,
          currency: 'usd',
          period: period,
        });
        return { type: 'selvo' as const, data: res as FungibleChart };
      } else {
        const res = await ApiClient.defillamaGetAssetChart({
          assetId: id,
          address,
          duration,
        });
        return { type: 'llama' as const, data: res };
      }
    },
    enabled: enabled && !!id && address.length > 0,
    staleTime: 30_000,
    refetchInterval: 30_000,
    placeholderData: keepPreviousData,
  });

  const chartPoints = useMemo(() => {
    if (!query.data) return [];

    if (query.data.type === 'selvo') {
      return formatFungibleChartPoints(query.data.data);
    } else {
      return query.data.data ? formatDefiLlamaPoints(query.data.data) : [];
    }
  }, [query.data]);

  return {
    chartPoints,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
}
