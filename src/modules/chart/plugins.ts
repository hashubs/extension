import type { Theme } from '@/ui/features/appearance';
import type { Plugin } from 'chart.js/auto';

export function drawRangePlugin({
  getStartRangeX,
  getTheme,
}: {
  getStartRangeX: () => number | null;
  getTheme: () => Theme;
}): Plugin<'scatter'> {
  return {
    id: 'drawRange',
    afterDraw: (chart) => {
      const activeElement = chart.getActiveElements()?.[0];
      const { ctx } = chart;
      const startRangeX = getStartRangeX();
      const theme = getTheme();

      if (!activeElement || !ctx || !startRangeX) {
        return;
      }

      const { x } = activeElement.element.tooltipPosition(false);

      if (x === null) {
        return;
      }

      ctx.save();

      // Fill background between clickedX and x
      ctx.beginPath();
      ctx.moveTo(startRangeX, 0);
      ctx.lineTo(startRangeX, chart.height);
      ctx.lineTo(x, chart.height);
      ctx.lineTo(x, 0);
      ctx.closePath();
      ctx.fillStyle =
        theme === 0 ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
      ctx.fill();

      ctx.restore();
    },
  };
}
