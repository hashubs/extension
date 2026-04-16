import { parseCaip19 } from '@/shared/chains/parse-caip19';
import { CHAIN_REGISTRY } from './chain-registry';
import { getChainRegistryByCaip } from './utils';

import unknownLogo from 'url:@/ui/assets/unknown.svg';

export function getChainLogo(caip: string): string {
  const parsed = parseCaip19(caip);
  const parsedId = parsed?.caip ?? caip;
  const chainRegistry = getChainRegistryByCaip(parsedId);
  return chainRegistry?.image ?? unknownLogo;
}

/**
 * Get the TOKEN logo for a native currency symbol.
 * Returns the logo from the canonical chain (e.g. ETH always shows the Ethereum diamond).
 * It finds the best match in the CHAIN_REGISTRY.
 */
export function getNativeTokenLogo(symbol: string): string {
  const upperSymbol = symbol?.toUpperCase();
  if (!upperSymbol) return unknownLogo;

  // Special cases for mapped symbols
  const searchSymbol = upperSymbol === 'MATIC' ? 'POL' : upperSymbol;

  const matches = CHAIN_REGISTRY.filter(
    (c) => c.native_coin_id?.toUpperCase() === searchSymbol
  );

  if (matches.length === 0) return unknownLogo;

  // Sort to find the most "canonical" chain:
  // 1. Not a testnet/devnet/sepolia
  // 2. Smallest numeric chain_identifier (for eip155)
  // 3. Mainnet in name
  const canonical = [...matches].sort((a, b) => {
    const aTest = /testnet|devnet|sepolia/i.test(a.name);
    const bTest = /testnet|devnet|sepolia/i.test(b.name);

    if (aTest !== bTest) return aTest ? 1 : -1;

    // Favor "Mainnet" in the name if both are not testnets
    const aMain = /mainnet/i.test(a.name);
    const bMain = /mainnet/i.test(b.name);
    if (aMain !== bMain) return aMain ? -1 : 1;

    // Smallest ID (usually L1)
    const aId = a.chain_identifier || 0;
    const bId = b.chain_identifier || 0;
    if (aId !== bId) {
      if (aId === 0) return 1; // 0 usually means non-EVM, push down unless it's all we have
      if (bId === 0) return -1;
      return aId - bId;
    }

    return 0;
  })[0];

  return canonical?.image ?? unknownLogo;
}
