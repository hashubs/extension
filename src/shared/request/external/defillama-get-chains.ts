import { DEFILLAMA_CHAIN_MAP } from '@/shared/chains/defillama';
import { CHAIN_NAMESPACES } from '@/shared/chains/types';

const CHAIN_ID_URL = 'https://chainid.network/chains.json';
const LLAMA_TVL_URL = 'https://api.llama.fi/chains';

type ChainNamespace = (typeof CHAIN_NAMESPACES)[keyof typeof CHAIN_NAMESPACES];

interface NativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
}

interface Explorer {
  name: string;
  url: string;
  standard: string;
}

export interface EVMChainDataResponse {
  id: string;
  namespace: ChainNamespace;
  name: string;
  chain: string;
  rpc: string[];
  nativeCurrency: NativeCurrency;
  chainId: number;
  explorers?: Explorer[];
  faucets?: string[];
  tvl?: number;
  status?: string;
  title?: string;
  network?: string;
}

interface DefiLlamaChain {
  name: string;
  tvl: number;
}

let tvlCache: DefiLlamaChain[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const TESTNET_KEYWORDS = [
  'testnet',
  'devnet',
  'sepolia',
  'goerli',
  'holesky',
  'mumbai',
  'amoy',
  'fuji',
  'chapel',
  'test',
  'staging',
  'sandbox',
  'ropsten',
  'rinkeby',
  'kovan',
  'cardona',
  'nitro',
  'stylus',
  'chapel',
  'localnet',
  'preview',
  'preprod',
];

export function isTestnet(chain: EVMChainDataResponse): boolean {
  const name = (chain.name || '').toLowerCase();
  const title = (chain.title || '').toLowerCase();
  const network = (chain.network || '').toLowerCase();

  // Explicit mainnet markers
  if (network === 'mainnet') return false;
  if (name.includes('mainnet') || title.includes('mainnet')) return false;

  // Explicit testnet markers
  if (network === 'testnet') return true;

  // Keyword check
  return TESTNET_KEYWORDS.some(
    (kw) => name.includes(kw) || title.includes(kw) || network.includes(kw)
  );
}

function isMainnet(chain: EVMChainDataResponse): boolean {
  return !isTestnet(chain);
}

async function fetchTVLData(): Promise<DefiLlamaChain[]> {
  const now = Date.now();
  if (tvlCache.length > 0 && now - lastFetchTime < CACHE_DURATION) {
    return tvlCache;
  }

  try {
    const response = await fetch(LLAMA_TVL_URL);
    if (response.ok) {
      tvlCache = (await response.json()) as DefiLlamaChain[];
      lastFetchTime = now;
      return tvlCache;
    }
  } catch (error) {
    console.error('[ChainRegistry] Error fetching TVL data:', error);
  }
  return tvlCache;
}

function populateTVL(chain: EVMChainDataResponse, tvlData: DefiLlamaChain[]) {
  const slug = DEFILLAMA_CHAIN_MAP[chain.chainId];
  if (slug) {
    const tvlInfo = tvlData.find(
      (c) => c.name.toLowerCase() === slug.toLowerCase()
    );
    if (tvlInfo) {
      chain.tvl = tvlInfo.tvl;
    }
  }
  return chain;
}

function getBaseName(name: string): string {
  if (!name) return '';

  return name
    .replace(/\s+(Sepolia|Goerli|Testnet|Mumbai|Fuji|Amoy|Hoodi)(\s+.*)?$/i, '')
    .replace(/\s+Test\s+Network$/i, '')
    .replace(/\s+Mainnet$/i, '')
    .replace(/\s+(One|C-Chain)$/i, '')
    .trim();
}

function applyTVLInheritance(
  chains: EVMChainDataResponse[],
  tvlData: DefiLlamaChain[]
): EVMChainDataResponse[] {
  const enriched = chains.map((chain) => populateTVL(chain, tvlData));

  const parentChainTvls: Record<string, number> = {};

  enriched.forEach((chain) => {
    if (chain.tvl && isMainnet(chain)) {
      const baseName = getBaseName(chain.name);
      if (!parentChainTvls[baseName] || parentChainTvls[baseName] < chain.tvl) {
        parentChainTvls[baseName] = chain.tvl;
      }
    }
  });

  return enriched.map((chain) => {
    if (isTestnet(chain) && !chain.tvl) {
      const baseName = getBaseName(chain.name);
      const parentTvl = parentChainTvls[baseName] || 0;
      return { ...chain, tvl: parentTvl };
    }
    return chain;
  });
}

function sortChains(chains: EVMChainDataResponse[]): EVMChainDataResponse[] {
  return [...chains].sort((a, b) => {
    // Sort by TVL (descending) primarily, if available
    const tvlDiff = (b.tvl || 0) - (a.tvl || 0);
    if (tvlDiff !== 0) return tvlDiff;

    // Then put mainnets first for items with equal TVL
    const aIsTest = isTestnet(a);
    const bIsTest = isTestnet(b);
    if (!aIsTest && bIsTest) return -1;
    if (aIsTest && !bIsTest) return 1;

    return 0;
  });
}

function toChainResponse(chain: EVMChainDataResponse): EVMChainDataResponse {
  return {
    ...chain,
    id: `eip155:${chain.chainId}`,
    namespace: 'eip155',
  };
}

export async function fetchChainData(
  chainId: number
): Promise<EVMChainDataResponse | null> {
  try {
    const [response, tvlData] = await Promise.all([
      fetch(CHAIN_ID_URL),
      fetchTVLData(),
    ]);

    if (!response.ok) {
      console.warn(
        '[ChainRegistry] Failed to fetch registry:',
        response.statusText
      );
      return null;
    }

    const data = (await response.json()) as EVMChainDataResponse[];
    const chain = data.find((c) => c.chainId === chainId);

    if (!chain) {
      console.warn(
        `[ChainRegistry] Chain ID ${chainId} not found in registry.`
      );
      return null;
    }

    return toChainResponse(populateTVL(chain, tvlData));
  } catch (error) {
    console.error('[ChainRegistry] Error fetching chain data:', error);
    return null;
  }
}

export async function fetchAllChains(
  limit = 4000
): Promise<EVMChainDataResponse[]> {
  try {
    const [response, tvlData] = await Promise.all([
      fetch(CHAIN_ID_URL),
      fetchTVLData(),
    ]);

    if (!response.ok) return [];

    const data = (await response.json()) as EVMChainDataResponse[];
    const activeChains = data.filter((c) => c.status !== 'deprecated');

    const enrichedChains = applyTVLInheritance(activeChains, tvlData);

    const result = sortChains(enrichedChains).slice(0, limit);
    return result.map(toChainResponse);
  } catch {
    return [];
  }
}
