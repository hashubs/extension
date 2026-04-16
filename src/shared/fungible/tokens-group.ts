import type { SanitizedPortfolio } from './sanitize-portfolio.js';

/**
 * Groups an array of TokenData by their native currency symbol.
 * Returns a Map preserving insertion order.
 */
export function groupTokensBySymbol(
  tokens: SanitizedPortfolio[]
): Map<string, SanitizedPortfolio[]> {
  const map = new Map<string, SanitizedPortfolio[]>();
  for (const t of tokens) {
    const key = t.symbol.toUpperCase();
    const existing = map.get(key);
    if (existing) {
      existing.push(t);
    } else {
      map.set(key, [t]);
    }
  }
  return map;
}
