import { parseCaip19 } from '@/modules/networks/helpers';
import { getChainRegistryByCaip } from '@/shared/chains/chain-registry';
import { getDefiLlamaPlatformKey } from '@/shared/chains/defillama';
import { ApiContext } from '../api-bare';
import { ClientOptions, HttpClient } from '../shared';

export type PriceResult = {
  price: number;
  priceChange: number | null;
  symbol?: string;
};

export interface PriceToken {
  assetId: string; // CAIP-19
  address: string;
}

export interface DefiLlamaPriceParams {
  nativeChainIds: string[];
  tokens?: PriceToken[];
}

export async function defillamaGetPriceFungible(
  this: ApiContext,
  params: DefiLlamaPriceParams,
  options: ClientOptions = { source: 'llama.fi' }
): Promise<Record<string, PriceResult>> {
  const { nativeChainIds, tokens = [] } = params;
  const result: Record<string, PriceResult> = {};

  const coinMap = new Map<string, string[]>();
  const erc20CoinMap = new Map<string, string>();

  const addToCoinMap = (coinKey: string, id: string) => {
    if (!coinMap.has(coinKey)) coinMap.set(coinKey, []);
    coinMap.get(coinKey)!.push(id);
  };

  // Native tokens
  for (const caip of nativeChainIds) {
    const registry = getChainRegistryByCaip(caip);
    if (registry?.gecko_id)
      addToCoinMap(`coingecko:${registry.gecko_id}`, caip);
  }

  // Tokens (Custom or Discovered)
  for (const token of tokens) {
    const parsed = parseCaip19(token.assetId);
    if (!parsed) continue;

    const mapKey = token.assetId;
    result[mapKey] = { price: 0, priceChange: 0 };

    const platform = getDefiLlamaPlatformKey(parsed.caip);
    if (platform) {
      erc20CoinMap.set(`${platform}:${token.address.toLowerCase()}`, mapKey);
    }
  }

  const allCoinKeys = [...coinMap.keys(), ...erc20CoinMap.keys()];
  if (allCoinKeys.length === 0) return result;

  const CHUNK_SIZE = 40;
  const chunks: string[][] = [];
  for (let i = 0; i < allCoinKeys.length; i += CHUNK_SIZE) {
    chunks.push(allCoinKeys.slice(i, i + CHUNK_SIZE));
  }

  const timestampA = Math.floor(Date.now() / 1000) - 86400;
  const kyOptions = this.getKyOptions();

  try {
    const fetchPromises = chunks.map(async (chunkKeys) => {
      const coinKeysParam = chunkKeys.join(',');

      const [priceData, changeData] = await Promise.all([
        HttpClient.get<any>(
          {
            endpoint: `prices/current/${coinKeysParam}?searchWidth=6h`,
            ...options,
          },
          kyOptions
        ),
        HttpClient.get<any>(
          {
            endpoint: `percentage/${coinKeysParam}?timestampA=${timestampA}&period=24h`,
            ...options,
          },
          kyOptions
        ),
      ]);

      return {
        prices: priceData.coins || {},
        changes: changeData.coins || {},
      };
    });

    const chunkResults = await Promise.allSettled(fetchPromises);

    chunkResults.forEach((promiseResult) => {
      if (promiseResult.status === 'fulfilled') {
        const { prices, changes } = promiseResult.value;

        // Process Native tokens
        for (const [coinKey, coinIds] of coinMap.entries()) {
          const price = prices?.[coinKey];
          if (!price) continue;
          const entry: PriceResult = {
            price: price.price,
            priceChange: changes?.[coinKey] ?? null,
            symbol: price.symbol,
          };
          for (const id of coinIds) result[id] = entry;
        }

        // Process ERC20/SPL tokens
        for (const [coinKey, mapKey] of erc20CoinMap.entries()) {
          const price = prices?.[coinKey];
          if (!price) continue;
          result[mapKey] = {
            price: price.price ?? 0,
            priceChange: changes?.[coinKey] ?? null,
            symbol: price.symbol,
          };
        }
      }
    });
  } catch (error) {
    console.warn(
      'defillamaGetPriceFungible: failed to fetch from DefiLlama',
      error
    );
  }

  return result;
}
