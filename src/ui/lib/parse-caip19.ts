export interface ParsedCaip19 {
  caip: string;
  chainId: string | number;
  assetNamespace?: string;
  assetReference?: string;
}

/**
 * Parse a CAIP-19 asset ID into its components.
 *   EVM:    eip155:1/erc20:0xabc... -> { id: "eip155:1", chainId: 1, assetNamespace: "erc20", assetReference: "0xabc..." }
 *   Solana: solana:mainnet/spl-token:8opv... -> { id: "solana:mainnet", chainId: "mainnet", assetNamespace: "spl-token", assetReference: "8opv..." }
 */
export function parseCaip19(assetId: string): ParsedCaip19 | null {
  const [chainPart, assetPart] = assetId.split("/");
  if (!chainPart) return null;

  const [, chainIdStr] = chainPart.split(":");
  if (!chainIdStr) return null;

  const chainIdNum = Number(chainIdStr);
  const chainId = isNaN(chainIdNum) ? chainIdStr : chainIdNum;

  if (!assetPart) {
    return {
      caip: chainPart,
      chainId,
    };
  }

  const [assetNamespace, assetReference] = assetPart.split(":");
  if (!assetNamespace || !assetReference) return null;

  return {
    caip: chainPart,
    chainId,
    assetNamespace,
    assetReference,
  };
}

/**
 * Extract the CAIP chain ID part (e.g., "eip155:1") from a full asset ID.
 * If no asset part is present, returns the input as is.
 */
export function getChainIdFromFullId(assetId: string): string {
  return assetId.split("/")[0];
}

/**
 * Get a consistent map key for a custom token.
 * Uses the full CAIP-19 asset ID as the key.
 *   EVM:    eip155:1/erc20:0xabc...
 *   Solana: solana:mainnet/spl-token:8opv...
 */
export function getCustomTokenKey(token: { assetId: string }): string {
  return token.assetId;
}
