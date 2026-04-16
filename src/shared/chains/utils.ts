import { CHAIN_REGISTRY } from './chain-registry';
import { DEFILLAMA_CHAIN_MAP } from './defillama';

/**
 * Gets the CAIP-style ID (e.g., "eip155:1") from a numeric chain ID.
 * @param chainId The numeric chain ID (e.g., 1 for Ethereum Mainnet)
 * @returns The CAIP-style ID string or undefined if not found
 */
export function getIdByChainId(chainId: number): string | undefined {
  // Special case for Solana internal server ID
  if (chainId === 501000101) {
    return 'solana:mainnet';
  }

  return (
    CHAIN_REGISTRY.find((chain) => chain.chain_identifier === chainId)?.caip ||
    undefined
  );
}

/**
 * Gets the numeric chain ID from a CAIP-style ID.
 * @param id The CAIP-style ID string (e.g., "eip155:1")
 * @returns The numeric chain ID or undefined if not found
 */
export function getChainIdById(id: string): number | undefined {
  // Special case for Solana
  if (id === 'solana:mainnet') {
    return 501000101;
  }

  const chain = CHAIN_REGISTRY.find((c) => c.caip === id);
  return chain?.chain_identifier || undefined;
}

/** Pre-built Map for O(1) chain registry lookup */
const CHAIN_REGISTRY_MAP = new Map(
  CHAIN_REGISTRY.filter((p) => p.chain_identifier !== null).map((p) => [
    p.chain_identifier as number,
    p,
  ])
);

/**
 * Gets the chain registry entry by CAIP-style ID.
 * @param id The CAIP-style CAIP string (e.g., "eip155:1")
 * @returns The chain registry entry or null if not found
 */
export function getChainRegistryByCaip(id: string) {
  return CHAIN_REGISTRY.find((p) => p.caip === id) ?? null;
}

/**
 * Gets the chain registry entry by numeric chain ID.
 * @param chainId The numeric chain ID (e.g., 1 for Ethereum Mainnet)
 * @returns The chain registry entry or null if not found
 */
export function getChainRegistryByChainId(chainId: number | string) {
  if (typeof chainId === 'string') return null;
  return CHAIN_REGISTRY_MAP.get(chainId) ?? null;
}

/**
 * Get DefiLlama platform key from a chain ID string (e.g. "eip155:1" → "ethereum", "solana:mainnet" → "solana").
 */
export function getDefiLlamaPlatformKey(chainId: string): string | null {
  if (chainId.startsWith('solana:')) return 'solana';
  if (chainId.startsWith('eip155:')) {
    const num = parseInt(chainId.split(':')[1], 10);
    return DEFILLAMA_CHAIN_MAP[num] ?? null;
  }
  return null;
}
