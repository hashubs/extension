import { getChartColor } from '@/modules/chart/helpers';
import type { Theme } from '@/ui/features/appearance';
import type { Plugin } from 'chart.js/auto';
import type { ParsedAssetChartPoint } from './types';

/**
 * Draws a grey dot at the active hover point when there is no transaction
 * action attached to that data point.
 */
export function drawDotPlugin({
  getTheme,
}: {
  getTheme: () => Theme;
}): Plugin<'scatter'> {
  return {
    id: 'drawDot',
    afterDraw: (chart) => {
      const activeElement = chart.getActiveElements()?.[0];
      const { ctx } = chart;

      if (!activeElement || !ctx) return;

      const { x, y } = activeElement.element.tooltipPosition(false);
      if (x === null || y === null) return;

      const hasPointData =
        'raw' in activeElement.element
          ? Boolean((activeElement.element.raw as ParsedAssetChartPoint)?.extra)
          : false;

      // If a transaction dot is already rendered by Chart.js, skip
      if (hasPointData) return;

      const theme = getTheme();
      const color = theme === 0 ? '#9c9fa8' : '#70737b';
      const border = theme === 0 ? '#ffffff' : '#16161a';

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.strokeStyle = border;
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    },
  };
}

/**
 * Draws a dashed vertical line from top to bottom of the chart at the active
 * hover point position, with a gap around the dot.
 */
export function drawVerticalLinePlugin({
  getTheme,
}: {
  getTheme: () => Theme;
}): Plugin<'scatter'> {
  return {
    id: 'verticalLine',
    afterDraw: (chart) => {
      const activeElement = chart.getActiveElements()?.[0];
      const { ctx } = chart;

      if (!activeElement || !ctx) return;

      const { x, y } = activeElement.element.tooltipPosition(false);
      if (x === null || y === null) return;

      const theme = getTheme();

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, chart.chartArea.top);
      ctx.lineTo(x, y - 10);
      ctx.moveTo(x, y + 10);
      ctx.lineTo(x, chart.chartArea.bottom);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = theme === 0 ? '#e1e1e1' : '#4b4b4d';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    },
  };
}

// Pulse cap point
export const PULSE_CAP_CIRCLE_ID = 'asset-chart-pulse-cap-circle';

/**
 * When no element is hovered, drives the animated pulsing dot positioned at
 * the last chart point via CSS custom properties on the #PULSE_CAP_CIRCLE_ID
 * element. Hides it while the user is hovering.
 */
export function drawCapPointPlugin({
  getTheme,
}: {
  getTheme: () => Theme;
}): Plugin<'scatter'> {
  return {
    id: 'capPoint',
    afterDraw: (chart) => {
      const activeElement = chart.getActiveElements()?.[0];
      const { ctx } = chart;
      const animatedElement = document.getElementById(PULSE_CAP_CIRCLE_ID);

      if (!ctx || activeElement) {
        animatedElement?.style.setProperty('--cap-dot-opacity', '0');
        return;
      }

      const chartPoints = chart.data.datasets.at(0)
        ?.data as ParsedAssetChartPoint[];

      // Don't show if the last point has a transaction dot
      if (chartPoints.at(-1)?.extra) {
        animatedElement?.style.setProperty('--cap-dot-opacity', '0');
        return;
      }

      const strokeColor = getChartColor({
        theme: getTheme(),
        isPositive:
          (chartPoints?.at(0)?.y || 0) <= (chartPoints?.at(-1)?.y || 0),
        isHighlighted: false,
      });

      const meta = chart.getDatasetMeta(0);
      const last = meta.data.at(-1);

      if (last == null) return;

      const x = (last as unknown as { x: number }).x;
      const y = (last as unknown as { y: number }).y;

      if (x == null || y == null) return;

      if (animatedElement) {
        animatedElement.style.setProperty('--pulse-color', strokeColor);
        animatedElement.style.setProperty('--pulse-x', `${x}px`);
        animatedElement.style.setProperty('--pulse-y', `${y}px`);
        animatedElement.style.setProperty('--cap-dot-opacity', '1');
      }
    },
  };
}

/**
 * Detects the active hovered element and calls onHoverChange with its index.
 */
export function hoverUpdatePlugin({
  onHoverChange,
}: {
  onHoverChange: (index: number | null) => void;
}): Plugin<'scatter'> {
  let lastIndex: number | null = -2;

  return {
    id: 'hoverUpdate',
    afterEvent: (chart, args) => {
      const { event } = args;

      if (event.type === 'mouseout') {
        if (lastIndex !== null) {
          lastIndex = null;
          onHoverChange(null);
        }
        return;
      }

      if (event.type === 'mousemove' || event.type === 'click') {
        const activeElements = chart.getActiveElements();
        const currentIndex = activeElements[0]?.index ?? null;

        if (currentIndex !== lastIndex) {
          lastIndex = currentIndex;
          onHoverChange(currentIndex);
        }
      }
    },
  };
}
