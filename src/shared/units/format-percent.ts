import type BigNumber from 'bignumber.js';
import memoize from 'memoize-one';
import { minus } from '../typography';
import { toNumber } from './to-number';

const getFormatter = memoize(
  (locale, maximumFractionDigits, minimumFractionDigits = 0) => {
    return Intl.NumberFormat(locale, {
      maximumFractionDigits,
      minimumFractionDigits,
    });
  }
);

export function formatPercentLocale(
  value: BigNumber.Value,
  locale: string,
  options?: { maximumFractionDigits?: number; minimumFractionDigits?: number }
) {
  const valueAsNumber = toNumber(value);
  const formatter = getFormatter(
    locale,
    options?.maximumFractionDigits ?? (valueAsNumber < 1 ? 2 : 1),
    options?.minimumFractionDigits
  );
  const sign = valueAsNumber < 0 ? minus : '';
  return `${sign}${formatter.format(Math.abs(valueAsNumber))}`;
}

export function formatPercentDisplay(value: number | null | undefined): string {
  if (value == null) return '0.00%';
  if (value === 0) return '+0.00%';

  const sign = value >= 0 ? '+' : '-';
  const absValue = Math.abs(value);

  if (absValue >= 1_000_000) {
    return `${sign}${(absValue / 1_000_000).toFixed(1)}M%`;
  }
  if (absValue >= 1_000) {
    return `${sign}${(absValue / 1_000).toFixed(2)}K%`;
  }

  return `${sign}${absValue.toFixed(2)}%`;
}
