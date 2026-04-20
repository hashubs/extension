import fiatData from '@/ui/views/settings/currency/fiat.json';

type FiatFormatOptions = {
  locale?: string;
  isTokenPrice?: boolean;
  compact?: boolean;
  maxDecimals?: number;
  minDecimals?: number;
};

/**
 * Format a fiat balance with the selected currency symbol.
 * @param value fiat value
 * @param currency currency symbol
 * @returns formatted fiat value as string
 */
export function formatFiat(
  input: number | string,
  currency: string = "usd",
  options: FiatFormatOptions = {},
): string {
  return formatFiatInternal(input, currency, options, false) as string;
}

/**
 * Format a fiat balance and return as Intl.NumberFormatPart[] for fine-grained UI styling.
 */
export function formatFiatToParts(
  input: number | string,
  currency: string = "usd",
  options: FiatFormatOptions = {},
): Intl.NumberFormatPart[] {
  return formatFiatInternal(input, currency, options, true) as Intl.NumberFormatPart[];
}

function formatFiatInternal(
  input: number | string,
  currency: string = "usd",
  options: FiatFormatOptions = {},
  toParts: boolean,
): string | Intl.NumberFormatPart[] {
  const {
    locale = "en-US",
    isTokenPrice = false,
    compact = false,
    maxDecimals,
    minDecimals,
  } = options;

  const value = normalizeInput(input);
  const currencyUpper = currency.toUpperCase();
  const lowerCode = currency.toLowerCase();
  const fiatConfig = (fiatData as Record<string, any>)[lowerCode];
  const overrideSymbol = fiatConfig ? fiatConfig.symbol : undefined;

  if (value === 0) {
    const formatter = buildFormatter(locale, currencyUpper, 2, 2);
    let parts = formatter.formatToParts(0);
    if (overrideSymbol) {
      parts = parts.map((p) =>
        p.type === 'currency' ? { ...p, value: overrideSymbol } : p
      );
    }
    return toParts ? parts : parts.map((p) => p.value).join('');
  }

  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  const currencySymbol = overrideSymbol || getCurrencySymbol(locale, currencyUpper);

  // =====================================================
  // SMART AUTO COMPACT (Magnitude Based)
  // =====================================================

  const shouldCompact =
    (compact || (isTokenPrice && abs >= 1_000_000)) && abs >= 1000;

  if (shouldCompact) {
    const compactResult = handleCompact(abs);
    if (compactResult) {
      if (toParts) {
        return [
          ...(sign ? [{ type: "minusSign" as const, value: sign }] : []),
          { type: "currency" as const, value: currencySymbol },
          ...parseSimplePriceToParts(compactResult),
        ];
      }
      return `${sign}${currencySymbol}${compactResult}`;
    }
  }

  // =====================================================
  // TOKEN MICRO (Very Small Price)
  // =====================================================

  if (isTokenPrice && abs > 0 && abs < 0.001) {
    const micro = handleTokenMicro(abs);
    if (micro) {
      if (toParts) {
        return [
          ...(sign ? [{ type: "minusSign" as const, value: sign }] : []),
          { type: "currency" as const, value: currencySymbol },
          ...parseSimplePriceToParts(micro),
        ];
      }
      return `${sign}${currencySymbol}${micro}`;
    }
  }

  // =====================================================
  // ULTRA SMALL NON TOKEN
  // =====================================================

  if (!isTokenPrice && abs > 0 && abs < 0.00001) {
    const formatter = buildFormatter(locale, currencyUpper, 5, 5);
    const threshold = formatter.format(0.00001);

    if (toParts) {
      const parts = formatter.formatToParts(0.00001);
      return [
        { type: "literal" as const, value: value < 0 ? "-< " : "< " },
        ...parts,
      ];
    }
    return value < 0 ? `-< ${threshold}` : `< ${threshold}`;
  }

  // =====================================================
  // STANDARD FORMAT
  // =====================================================

  const dynamicMax = resolveDynamicDecimals(abs, isTokenPrice, maxDecimals);

  const formatter = buildFormatter(
    locale,
    currencyUpper,
    minDecimals ?? 2,
    dynamicMax,
  );

  let parts = formatter.formatToParts(value);
  if (overrideSymbol) {
    parts = parts.map((p) =>
      p.type === 'currency' ? { ...p, value: overrideSymbol } : p
    );
  }

  return toParts ? parts : parts.map((p) => p.value).join('');
}

function parseSimplePriceToParts(price: string): Intl.NumberFormatPart[] {
  const parts: Intl.NumberFormatPart[] = [];
  let current = "";

  // This is a naive parser for the results of handleCompact and handleTokenMicro
  // It identifies integer, decimal, fraction and literal/compact parts
  let mode: "integer" | "decimal" | "fraction" | "literal" = "integer";

  for (let i = 0; i < price.length; i++) {
    const char = price[i];
    if (char === ".") {
      if (current) parts.push({ type: mode as any, value: current });
      parts.push({ type: "decimal", value: "." });
      current = "";
      mode = "fraction";
    } else if (
      (mode === "integer" || mode === "fraction") &&
      !/[\d,]/.test(char)
    ) {
      // Transition to literal if non-digit (like K, M, B, T or subscripts)
      if (current) parts.push({ type: mode as any, value: current });
      current = char;
      mode = "literal";
    } else {
      current += char;
    }
  }

  if (current) {
    parts.push({ type: mode as any, value: current });
  }

  return parts;
}

// =====================================================
// HELPERS
// =====================================================

function normalizeInput(value: number | string): number {
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return value;
}

function buildFormatter(
  locale: string,
  currency: string,
  min: number,
  max: number,
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  });
}

function getCurrencySymbol(locale: string, currency: string): string {
  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).formatToParts(0);

  return parts.find((p) => p.type === "currency")?.value ?? "$";
}

function handleCompact(value: number): string | null {
  const units = [
    { value: 1e12, symbol: "T" },
    { value: 1e9, symbol: "B" },
    { value: 1e6, symbol: "M" },
    { value: 1e3, symbol: "K" },
  ];

  for (const unit of units) {
    if (value >= unit.value) {
      return (
        (value / unit.value)
          .toFixed(2)
          .replace(/\.00$/, "")
          .replace(/(\.\d)0$/, "$1") + unit.symbol
      );
    }
  }

  return null;
}

function handleTokenMicro(value: number): string | null {
  const fixed = value.toFixed(20).replace(/\.?0+$/, "");
  if (!fixed.includes(".")) return null;

  const [intPart, decPart] = fixed.split(".");
  let leadingZeros = 0;

  for (const char of decPart) {
    if (char === "0") leadingZeros++;
    else break;
  }

  if (leadingZeros < 3) return null;

  const significant = decPart.substring(leadingZeros, leadingZeros + 4);

  const subscriptMap: Record<string, string> = {
    "0": "{0}",
    "1": "{1}",
    "2": "{2}",
    "3": "{3}",
    "4": "{4}",
    "5": "{5}",
    "6": "{6}",
    "7": "{7}",
    "8": "{8}",
    "9": "{9}",
  };

  const subscript = leadingZeros
    .toString()
    .split("")
    .map((d) => subscriptMap[d])
    .join("");

  return `${intPart}.0${subscript}${significant}`;
}

function resolveDynamicDecimals(
  value: number,
  isTokenPrice: boolean,
  override?: number,
): number {
  if (override) return override;

  if (isTokenPrice && value < 1) return 5;

  if (value >= 0.00001 && value < 0.01) {
    const str = value.toFixed(20).replace(/0+$/, "");
    const decimals = str.split(".")[1] || "";

    let leadingZeros = 0;
    for (const char of decimals) {
      if (char === "0") leadingZeros++;
      else break;
    }

    return Math.min(leadingZeros + 2, 5);
  }

  return 2;
}
