import { ellipsis, minus } from '@/shared/typography';
import type { AssetChartAction, AssetChartActions } from './types';
import { formatFiat } from '@/shared/units/format-fiat';

const SMALL_QUANTITY_THRESHOLD = 0.0000001;

function trimSymbol(symbol: string) {
  return symbol.length > 5 ? `${symbol.slice(0, 5)}${ellipsis}` : symbol;
}

function formatTokenQty(qty: number, symbol: string): string {
  const abs = Math.abs(qty);
  const opts: Intl.NumberFormatOptions =
    abs >= 100_000
      ? { notation: 'compact', maximumFractionDigits: 2 }
      : { maximumFractionDigits: abs < 1 ? 6 : 2 };

  return `${new Intl.NumberFormat('en', opts).format(abs)} ${trimSymbol(
    symbol
  )}`;
}

export type AssetChartPointAction = {
  title: string;
  balance: string;
  value: string;
  direction: AssetChartActions['total']['direction'];
};

/**
 * Converts a chart action & token metadata into a JSON string for passing
 * through Chart.js tooltip callbacks (title / label).
 */
export function serializeAssetChartActions({
  action,
  symbol,
  currency,
}: {
  action: AssetChartAction;
  symbol: string;
  currency: string;
}): string {
  const qtyNum = parseFloat(action.quantity);
  const isSmall = Math.abs(qtyNum) < SMALL_QUANTITY_THRESHOLD;
  const isPositive = qtyNum >= 0;

  const balancePrefix = isPositive ? '+' : minus;
  const balanceSizeMarker = isSmall ? '<' : '';
  const displayQty = isSmall ? SMALL_QUANTITY_THRESHOLD : Math.abs(qtyNum);

  const data: AssetChartPointAction = {
    title: action.type
      ? action.type.charAt(0).toUpperCase() + action.type.slice(1)
      : 'Total',
    balance: `${balancePrefix}${balanceSizeMarker}${formatTokenQty(
      displayQty,
      symbol
    )}`,
    value: formatFiat(Math.abs(action.value), currency),
    direction: action.direction,
  };

  return JSON.stringify(data);
}

export function deserializeAssetChartActions(
  data: string
): AssetChartPointAction {
  return JSON.parse(data) as AssetChartPointAction;
}
