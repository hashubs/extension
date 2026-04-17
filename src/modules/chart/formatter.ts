import { DefiLlamaChartPoint } from '@/shared/request/external/defillama-get-asset-chart';
import {
  AssetChartActions,
  AssetChartPoint,
  FungibleChart,
} from '@/ui/components/fungible/chart-fungible/types';

/**
 * Convert DefiLlama price-history points (no actions) into the generic
 * ChartPoint format consumed by <Chart />.
 *
 * Each point = [timestamp (s), price, null]
 */
export function formatDefiLlamaPoints(
  points: DefiLlamaChartPoint[]
): AssetChartPoint[] {
  return points.map((p) => [p.timestamp, p.price, null]);
}

/**
 * Server response shape for /asset/fungible/chart
 * (matches server/src/services/zerion/chart.ts FungibleChart)
 */
export interface FungibleChartPoint {
  timestamp: number;
  value: number;
  actions: AssetChartActions | null;
}

/**
 * Convert Zerion-style FungibleChart server response into the generic
 * ChartPoint format consumed by <Chart />.
 *
 * When an action is present, it is attached as the third tuple element.
 */
export function formatFungibleChartPoints(
  chart: FungibleChart
): AssetChartPoint[] {
  return chart.points.map((p) => [p.timestamp, p.value, p.actions ?? null]);
}
