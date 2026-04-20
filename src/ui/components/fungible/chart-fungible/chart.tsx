import { Chart } from '@/modules/chart/chart';
import type {
  ChartDatasetConfig,
  ChartInteraction,
  ChartPlugins,
  ChartTooltipOptions,
} from '@/modules/chart/types';
import type { ChartPeriod } from '@/shared/request/external/asset-get-fungible-chart';
import { themeStore } from '@/ui/features/appearance';
import { useFungibleChart } from '@/ui/hooks/request/external/use-fungible-chart';
import { useFiatConversion } from '@/ui/hooks/useFiatConversion';
import { cn } from '@/ui/lib/utils';
import { useStore } from '@store-unit/react';
import type { PointStyle } from 'chart.js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { serializeAssetChartActions } from './helpers';
import {
  drawCapPointPlugin,
  drawDotPlugin,
  drawVerticalLinePlugin,
  hoverUpdatePlugin,
  PULSE_CAP_CIRCLE_ID,
} from './plugins';
import { externalTooltip } from './tooltip';
import type {
  AssetChartActionDirection,
  AssetChartPoint,
  ParsedAssetChartPoint,
} from './types';

import { useParams } from 'react-router-dom';
import { OptimisticFungibleInfo } from '../fungible-info';

import DotNegativeDark from 'data-url:@/ui/assets/chart-dot-negative-dark.svg';
import DotNegativeLight from 'data-url:@/ui/assets/chart-dot-negative-light.svg';
import DotPositiveDark from 'data-url:@/ui/assets/chart-dot-positive-dark.svg';
import DotPositiveLight from 'data-url:@/ui/assets/chart-dot-positive-light.svg';

import './interaction'; // registers magneticActions mode side-effect

const PERIOD_OPTIONS: { label: string; value: ChartPeriod }[] = [
  { label: '1H', value: '1h' },
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
  { label: '1M', value: '1m' },
  { label: '1Y', value: '1y' },
];

const DotImages = {
  in: { light: new Image(), dark: new Image() },
  out: { light: new Image(), dark: new Image() },
};

DotImages.in.light.src = DotPositiveLight;
DotImages.in.dark.src = DotPositiveDark;
DotImages.out.light.src = DotNegativeLight;
DotImages.out.dark.src = DotNegativeDark;

function getPointColor(
  theme: 0 | 1,
  direction: AssetChartActionDirection
): string {
  const isLight = theme === 0;
  return !direction || direction === 'in'
    ? isLight
      ? '#01a643'
      : '#4fbf67'
    : isLight
    ? '#ff4a4a'
    : '#ff5c5c';
}

function getPointBorderColor(
  theme: 0 | 1,
  direction: AssetChartActionDirection
): string {
  const isLight = theme === 0;
  return !direction || direction === 'in'
    ? isLight
      ? '#edfcf2'
      : '#29342f'
    : isLight
    ? '#fcf2ef'
    : '#382328';
}

function getPointStyle(
  theme: 0 | 1,
  count: number,
  direction: AssetChartActionDirection
): PointStyle {
  if (count > 1) {
    return DotImages[direction || 'in'][theme === 0 ? 'light' : 'dark'];
  }
  return 'circle';
}

const PULSE_STYLE = `
  @keyframes assetChartPulse {
    0%   { background-color: var(--pulse-color); transform: scale(1); }
    70%  { background-color: transparent; transform: scale(4); }
    100% { background-color: transparent; transform: scale(1); }
  }
  #${PULSE_CAP_CIRCLE_ID} {
    --cap-dot-size: 5px;
    --cap-dot-opacity: 1;
    --pulse-color: transparent;
    width: calc(var(--cap-dot-size) + 4px);
    height: calc(var(--cap-dot-size) + 4px);
    position: absolute;
    top: var(--pulse-y);
    left: var(--pulse-x);
    transform: translate(-50%, -50%);
    border: 2px solid transparent;
    pointer-events: none;
    opacity: var(--cap-dot-opacity);
    transition: opacity 0.2s;
  }
  #${PULSE_CAP_CIRCLE_ID}::after {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: var(--cap-dot-size);
    height: var(--cap-dot-size);
    border-radius: 50%;
    background-color: var(--background, #fff);
    border: 2px solid var(--pulse-color);
  }
  #${PULSE_CAP_CIRCLE_ID}::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: var(--cap-dot-size);
    height: var(--cap-dot-size);
    animation: assetChartPulse 3s infinite;
    background-color: var(--pulse-color);
    border: 2px solid transparent;
    border-radius: 50%;
    transform-origin: 50% 50%;
    transform: scale(1);
  }
`;

export interface FungibleChartChangeData {
  price: number;
  changeAmount: number;
  changePercent: number;
  isPositive: boolean;
}

interface AssetChartProps {
  data: OptimisticFungibleInfo | null;
  currentPrice?: number;
  currentChangePercent?: number;
  onChartDataChange?: (data: FungibleChartChangeData) => void;
}

export function FungibleChart({
  data,
  currentPrice = 0,
  currentChangePercent = 0,
  onChartDataChange,
}: AssetChartProps) {
  const { id } = useParams();
  const decodedId = id ? decodeURIComponent(id) : undefined;
  const { theme } = useStore(themeStore);

  const { defaultCurrency } = useFiatConversion();

  const [period, setPeriod] = useState<ChartPeriod>('1d');

  const themeRef = useRef(theme);
  themeRef.current = theme;

  const symbolRef = useRef(data?.symbol!);
  symbolRef.current = data?.symbol!;

  const { chartPoints, isLoading, isFetching } = useFungibleChart({
    id: decodedId,
    address: data?.address!,
    period,
  });

  // Stable callback for plugins using a Ref
  const updatePriceDataRef = useRef<(index: number | null) => void>(() => {});

  updatePriceDataRef.current = (index: number | null) => {
    if (!onChartDataChange) return;

    if (chartPoints.length < 1) {
      onChartDataChange({
        price: currentPrice,
        changeAmount: 0,
        changePercent: currentChangePercent,
        isPositive: currentChangePercent >= 0,
      });
      return;
    }

    const firstVal = chartPoints[0][1];
    let targetIndex = index ?? chartPoints.length - 1;

    if (targetIndex < 0 || targetIndex >= chartPoints.length) {
      targetIndex = chartPoints.length - 1;
    }

    const currentVal = chartPoints[targetIndex][1];
    const change = currentVal - firstVal;
    const pct = firstVal !== 0 ? (change / firstVal) * 100 : 0;

    onChartDataChange({
      price: currentVal,
      changeAmount: change,
      changePercent: pct,
      isPositive: change >= 0,
    });
  };

  const onHoverChange = useCallback((index: number | null) => {
    updatePriceDataRef.current(index);
  }, []);

  useEffect(() => {
    onHoverChange(null);
  }, [chartPoints, onHoverChange]);

  // onRangeSelect (placeholder — no-op, parent can wire up)
  const onRangeSelect = (_: {
    startRangeIndex: number | null;
    endRangeIndex: number | null;
  }) => {};

  const datasetConfig = useMemo<ChartDatasetConfig>(
    () => ({
      pointRadius: (ctx) => {
        const hasData = Boolean((ctx.raw as ParsedAssetChartPoint)?.extra);
        return hasData ? 4 : 0;
      },
      pointHoverRadius: (ctx) => {
        const hasData = Boolean((ctx.raw as ParsedAssetChartPoint)?.extra);
        return hasData ? 4 : 0;
      },
      animations: { radius: { duration: 200 } },
      pointBorderColor: (ctx) => {
        const pt = ctx.raw as ParsedAssetChartPoint;
        return getPointBorderColor(
          themeRef.current,
          pt?.extra?.total.direction ?? null
        );
      },
      pointBackgroundColor: (ctx) => {
        const pt = ctx.raw as ParsedAssetChartPoint;
        return getPointColor(
          themeRef.current,
          pt?.extra?.total.direction ?? null
        );
      },
      pointStyle: (ctx) => {
        const pt = ctx.raw as ParsedAssetChartPoint;
        return getPointStyle(
          themeRef.current,
          pt?.extra?.count ?? 0,
          pt?.extra?.total.direction ?? null
        );
      },
      pointBorderWidth: 1,
    }),
    []
  );

  const tooltip = useMemo<ChartTooltipOptions>(
    () => ({
      external: externalTooltip,
      callbacks: {
        title: (ctx) => {
          const actions = (ctx[0].raw as ParsedAssetChartPoint)?.extra;
          return actions
            ? serializeAssetChartActions({
                action: {
                  ...actions.total,
                  // color total by value sign, not direction
                  direction:
                    actions.total.value > 0
                      ? 'in'
                      : actions.total.value < 0
                      ? 'out'
                      : null,
                },
                symbol: symbolRef.current,
                currency: defaultCurrency,
              })
            : '';
        },
        beforeBody: (ctx) => {
          const actions = (ctx[0].raw as ParsedAssetChartPoint)?.extra;
          return actions ? `${actions.count}` : '';
        },
        label: (ctx) => {
          const actions = (ctx.raw as ParsedAssetChartPoint)?.extra;
          return actions
            ? actions.preview.map((action) =>
                serializeAssetChartActions({
                  action,
                  symbol: symbolRef.current,
                  currency: defaultCurrency,
                })
              )
            : '';
        },
      },
    }),
    [defaultCurrency]
  );

  const plugins = useMemo<ChartPlugins>(
    () => [
      drawDotPlugin({ getTheme: () => themeRef.current }),
      drawVerticalLinePlugin({ getTheme: () => themeRef.current }),
      drawCapPointPlugin({ getTheme: () => themeRef.current }),
      hoverUpdatePlugin({ onHoverChange }),
    ],
    [onHoverChange]
  );

  const interaction = useMemo<ChartInteraction>(
    () => ({ mode: 'magneticActions' }),
    []
  );

  const showSkeleton = isLoading && chartPoints.length === 0;

  return (
    <div className="relative pt-4">
      <style dangerouslySetInnerHTML={{ __html: PULSE_STYLE }} />
      <div
        className={cn(
          'relative w-full',
          isFetching &&
            chartPoints.length > 0 &&
            'opacity-60 transition-opacity duration-300'
        )}
      >
        {showSkeleton ? (
          <div className="h-[205px] flex items-center justify-center">
            <div className="w-full h-[2px] bg-muted/40 rounded animate-pulse" />
          </div>
        ) : chartPoints.length === 0 ? (
          <div className="h-[205px] flex items-center justify-center text-muted-foreground/50 text-sm">
            No chart data
          </div>
        ) : (
          <>
            <Chart
              chartPoints={chartPoints as AssetChartPoint[]}
              onRangeSelect={onRangeSelect}
              datasetConfig={datasetConfig}
              tooltip={tooltip}
              plugins={plugins}
              interaction={interaction}
              style={{ position: 'relative', width: '100%' }}
              theme={theme}
              currency={defaultCurrency}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
              }}
            >
              <div id={PULSE_CAP_CIRCLE_ID} />
            </div>
          </>
        )}
      </div>

      {!showSkeleton && (
        <div className="flex justify-end gap-1 mt-6 pr-2">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={cn(
                'text-[10px] px-[7px] py-[2px] rounded-full border cursor-pointer transition-all',
                opt.value === period
                  ? 'bg-primary/10 text-primary border-transparent font-medium'
                  : 'bg-transparent border-border/50 text-muted-foreground hover:border-border'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
