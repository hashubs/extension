import type { SortOption } from "@/components/popover/sort-selector";
import type { SanitizedPortfolio } from "@/lib/token/sanitize-portfolio";

export function sortTokens(
  tokens: SanitizedPortfolio[],
  sortOrder: SortOption,
): SanitizedPortfolio[] {
  return [...tokens].sort((a, b) => {
    if (sortOrder === "native-top") {
      const aNative = a.type === "TOKEN_TYPE_NATIVE";
      const bNative = b.type === "TOKEN_TYPE_NATIVE";
      if (aNative && !bNative) return -1;
      if (!aNative && bNative) return 1;

      // If both are native or both are tokens, sort by balance
      if (b.valueUsd !== a.valueUsd) {
        return b.valueUsd - a.valueUsd;
      }
    }

    if (sortOrder === "declining-balance") {
      if (b.valueUsd !== a.valueUsd) {
        return b.valueUsd - a.valueUsd;
      }
    }
    return a.symbol.localeCompare(b.symbol);
  });
}
