import type { ChartPoint, ParsedChartPoint } from '@/modules/chart/types';
import type {
  AssetChartAction,
  AssetChartActionDirection,
  AssetChartActions,
  Response as FungibleChart,
} from '@/shared/request/external/asset-get-fungible-chart';

// The extra payload attached to each chart data-point (null if no transaction)
export type AssetChartPoint = ChartPoint<AssetChartActions | null>;
export type ParsedAssetChartPoint = ParsedChartPoint<AssetChartActions | null>;

// Re-export from the request module for convenience
export type {
  AssetChartAction,
  AssetChartActionDirection,
  AssetChartActions,
  FungibleChart,
};
