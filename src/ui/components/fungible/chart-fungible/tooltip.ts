import type { Chart, TooltipOptions } from 'chart.js';
import { deserializeAssetChartActions } from './helpers';
import type { AssetChartActions } from './types';

type ExternalTooltip = TooltipOptions<'scatter'>['external'];

// Pulse animation styles (injected once)

let pulseStyleInjected = false;

function injectPulseStyle() {
  if (pulseStyleInjected) return;
  pulseStyleInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    .asset-chart-tooltip {
      opacity: 1;
      pointer-events: none;
      position: absolute;
      font-size: 12px;
      letter-spacing: 0.38px;
      white-space: nowrap;
      transition: opacity 0.3s ease-in-out, filter 0.2s;
      filter: blur(0px);
    }
  `;
  document.head.appendChild(style);
}

// Tooltip element factory

function getOrCreateTooltip(chart: Chart): HTMLDivElement {
  injectPulseStyle();
  let el = chart.canvas.parentNode?.querySelector('.asset-chart-tooltip') as
    | HTMLDivElement
    | undefined;

  if (!el) {
    el = document.createElement('div');
    el.className = 'asset-chart-tooltip';
    chart.canvas.parentNode?.appendChild(el);
  }
  return el;
}

// Helper DOM builder

function r(
  tag: string,
  attrs: Record<string, string> | null,
  ...children: (HTMLElement | string | null)[]
): HTMLElement {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'style') el.setAttribute('style', v);
      else el.setAttribute(k, v);
    }
  }
  for (const child of children) {
    if (child == null) continue;
    if (typeof child === 'string')
      el.appendChild(document.createTextNode(child));
    else el.appendChild(child);
  }
  return el;
}

function getItemColor(direction: AssetChartActions['total']['direction']) {
  return direction === 'in'
    ? 'var(--positive-500, #22c55e)'
    : direction === 'out'
    ? 'var(--negative-500, #ef4444)'
    : undefined;
}

function buildSingleTooltip(titleJson: string): HTMLElement {
  const item = deserializeAssetChartActions(titleJson);
  const color = getItemColor(item.direction);

  return r(
    'div',
    {
      style:
        'padding:8px 12px;background-color:color-mix(in srgb,var(--background,#1a1a1a) 85%,transparent);border-radius:12px;color:var(--foreground,#fff);font-size:12px;letter-spacing:0.38px',
    },
    r(
      'div',
      { style: 'font-weight:500' },
      r('span', null, item.title),
      r(
        'span',
        { style: `color:${color ?? 'inherit'};margin-left:4px` },
        item.balance
      )
    ),
    r('div', { style: 'font-weight:400' }, item.value)
  );
}

function buildMultiTooltip(
  titleJson: string,
  previewJsons: string[],
  totalCount: number
): HTMLElement {
  const total = deserializeAssetChartActions(titleJson);
  const items = previewJsons.map((j) => deserializeAssetChartActions(j));
  const extraCount = totalCount - items.length;

  return r(
    'div',
    {
      style:
        'padding:8px 12px;background-color:color-mix(in srgb,var(--background,#1a1a1a) 85%,transparent);border-radius:12px;color:var(--foreground,#fff);font-size:12px;letter-spacing:0.38px',
    },
    ...items.map((item) =>
      r(
        'div',
        {
          style:
            'font-weight:500;margin-bottom:4px;display:flex;justify-content:space-between;width:100%;gap:4px',
        },
        r('div', null, item.title),
        r(
          'div',
          null,
          r(
            'span',
            { style: `color:${getItemColor(item.direction) ?? 'inherit'}` },
            item.balance
          ),
          r('span', { style: 'font-weight:400;padding-left:4px' }, item.value)
        )
      )
    ),
    extraCount > 0
      ? r(
          'div',
          { style: 'color:var(--neutral-500,#71717a)' },
          `+${extraCount} item${extraCount > 1 ? 's' : ''}`
        )
      : null,
    r('div', {
      style:
        'width:100%;height:1px;margin-block:8px;background-color:var(--neutral-500,#71717a)',
    }),
    r(
      'div',
      {
        style:
          'font-weight:500;display:flex;justify-content:space-between;width:100%;gap:4px',
      },
      r('div', null, 'Total'),
      r(
        'div',
        null,
        r(
          'span',
          { style: `color:${getItemColor(total.direction) ?? 'inherit'}` },
          total.balance
        ),
        r('span', { style: 'font-weight:400;padding-left:4px' }, total.value)
      )
    )
  );
}

// External tooltip handler

export const externalTooltip: ExternalTooltip = ({ chart, tooltip }) => {
  const tooltipEl = getOrCreateTooltip(chart);

  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = '0';
    tooltipEl.style.filter = 'blur(4px)';
    tooltipEl.innerHTML = '';
    return;
  }

  if (tooltip.body) {
    const totalAction = tooltip.title[0];
    const totalActionsCount = Number(tooltip.beforeBody[0]);
    const previewActions = tooltip.body.map((b) => b.lines)[0] ?? [];

    if (!totalAction) {
      tooltipEl.style.opacity = '0';
      tooltipEl.style.filter = 'blur(4px)';
      tooltipEl.innerHTML = '';
      return;
    }

    if (totalActionsCount === 1) {
      tooltipEl.replaceChildren(buildSingleTooltip(totalAction));
    } else {
      tooltipEl.replaceChildren(
        buildMultiTooltip(totalAction, previewActions, totalActionsCount)
      );
    }
  }

  const { offsetLeft: posX, offsetTop: posY } = chart.canvas;
  const inRightHalf = chart.width / 2 < tooltip.caretX;
  const inMiddle =
    chart.width * 0.3 < tooltip.caretX && tooltip.caretX < chart.width * 0.7;
  const wide = tooltipEl.clientWidth > chart.width * 0.4;

  tooltipEl.style.opacity = '1';
  tooltipEl.style.filter = 'blur(0px)';
  tooltipEl.style.left = posX + tooltip.caretX + 'px';
  tooltipEl.style.top = posY + tooltip.caretY + 'px';
  tooltipEl.style.transform =
    inMiddle && wide
      ? 'translate(-50%, 8px)'
      : inRightHalf
      ? 'translate(calc(-100% - 8px), -8px)'
      : 'translate(8px, -8px)';
};
