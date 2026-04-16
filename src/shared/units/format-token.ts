import { BigNumber } from 'bignumber.js';
import memoize from 'lodash/memoize';
import { NBSP } from '../typography';

const tokenValueFormatters = {
  default: new Intl.NumberFormat('en', {
    useGrouping: false,
    maximumFractionDigits: 3,
  }),
  '<0.1': new Intl.NumberFormat('en', { maximumSignificantDigits: 2 }),
};

export function roundTokenValue(value: BigNumber.Value) {
  const number = value instanceof BigNumber ? value.toNumber() : Number(value);
  const formatter =
    Math.abs(number) < 0.1
      ? tokenValueFormatters['<0.1']
      : tokenValueFormatters.default;
  return formatter.format(number);
}

const getDefaultFormatter = memoize((notation?: 'compact') => {
  return new Intl.NumberFormat('en', {
    maximumFractionDigits: notation === 'compact' ? 1 : 20,
    notation,
  });
});

export function formatTokenValue(
  value: BigNumber.Value,
  symbol?: string,
  { notation }: { notation?: 'compact' } = {}
) {
  const roundedString = roundTokenValue(value);
  const formatter = getDefaultFormatter(notation);
  const result = formatter.format(Number(roundedString));
  return symbol ? `${result}${NBSP}${symbol}` : result;
}

export function formatTokenAmount(
  value: number | string | null | undefined,
  symbol?: string,
  options: {
    decimals?: number;
    compact?: boolean;
    fixPrecision?: number;
  } = {}
): string {
  const { decimals = 0, compact = true, fixPrecision } = options;

  if (value == null || value === '')
    return '0.00' + (symbol ? ` ${symbol}` : '');

  let amount = Number(value);
  if (decimals > 0) {
    amount = amount / Math.pow(10, decimals);
  }

  if (isNaN(amount) || amount === 0)
    return '0.00' + (symbol ? ` ${symbol}` : '');

  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (absAmount > 0 && absAmount < 0.01) {
    const fixed = absAmount.toFixed(20).replace(/\.?0+$/, '');
    if (fixed.includes('.')) {
      const [intPart, decPart] = fixed.split('.');
      let leadingZeros = 0;
      for (const char of decPart) {
        if (char === '0') leadingZeros++;
        else break;
      }

      if (leadingZeros >= 4) {
        const significantPart = decPart.substring(
          leadingZeros,
          leadingZeros + 4
        );
        const subscriptMap: { [key: string]: string } = {
          '0': '₀',
          '1': '₁',
          '2': '₂',
          '3': '₃',
          '4': '₄',
          '5': '₅',
          '6': '₆',
          '7': '₇',
          '8': '₈',
          '9': '₉',
        };
        const subscriptZeros = leadingZeros
          .toString()
          .split('')
          .map((d) => subscriptMap[d] || d)
          .join('');
        const subscriptStr = `${sign}${intPart}.0${subscriptZeros}${significantPart}`;
        return symbol ? `${subscriptStr} ${symbol}` : subscriptStr;
      }
    }
  }

  let result = '';

  if (compact && absAmount >= 1000) {
    if (absAmount >= 1_000_000_000_000_000) {
      result = sign + absAmount.toExponential(2);
    } else if (absAmount >= 1_000_000_000_000) {
      result =
        sign +
        (absAmount / 1_000_000_000_000).toLocaleString('en-US', {
          maximumFractionDigits: 2,
        }) +
        'T';
    } else if (absAmount >= 1_000_000_000) {
      result =
        sign +
        (absAmount / 1_000_000_000).toLocaleString('en-US', {
          maximumFractionDigits: 2,
        }) +
        'B';
    } else if (absAmount >= 1_000_000) {
      result =
        sign +
        (absAmount / 1_000_000).toLocaleString('en-US', {
          maximumFractionDigits: 2,
        }) +
        'M';
    } else if (absAmount >= 100_000) {
      result =
        sign +
        (absAmount / 1_000).toLocaleString('en-US', {
          maximumFractionDigits: 1,
        }) +
        'K';
    } else {
      result =
        sign +
        absAmount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
    }
  } else {
    result =
      sign +
      absAmount.toLocaleString('en-US', {
        minimumFractionDigits: fixPrecision !== undefined ? fixPrecision : 2,
        maximumFractionDigits: fixPrecision !== undefined ? fixPrecision : 6,
      });
  }

  return symbol ? `${result} ${symbol}` : result;
}
