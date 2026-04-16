import { parseCaip19 } from '@/shared/chains/parse-caip19';
import { ApiContext } from '../api-bare';
import { ClientOptions, HttpClient } from '../shared';
import {
  getChainRegistryByCaip,
  getDefiLlamaPlatformKey,
} from '@/shared/chains/utils';

export interface DefiLlamaChartPoint {
  timestamp: number;
  price: number;
}

export interface DefiLlamaChartResponse {
  coins: {
    [key: string]: {
      symbol: string;
      confidence: number;
      decimals: number;
      prices: DefiLlamaChartPoint[];
    };
  };
}

export interface DefiLlamaParams {
  assetId: string;
  address: string;
  duration: string;
}

export async function defillamaGetAssetChart(
  this: ApiContext,
  params: DefiLlamaParams,
  options: ClientOptions = { source: 'llama.fi' }
): Promise<DefiLlamaChartPoint[] | null> {
  const { assetId, address, duration } = params;
  const parsed = parseCaip19(assetId);
  const parsedId = parsed?.caip ?? assetId;

  const isNative = address === 'native' || parsed?.assetNamespace === 'slip44';

  let coinKey: string | null = null;

  if (isNative) {
    const registry = getChainRegistryByCaip(parsedId);
    if (!registry?.gecko_id) return null;
    coinKey = `coingecko:${registry.gecko_id}`;
  } else {
    const platform = getDefiLlamaPlatformKey(parsedId);
    if (!platform) return null;
    coinKey = `${platform}:${address.toLowerCase()}`;
  }

  if (!coinKey) return null;

  const now = Math.floor(Date.now() / 1000);
  let start = now;
  let period = '1d';
  let span = 100;

  switch (duration) {
    case 'HOUR':
      start = now - 60 * 60;
      period = '1m';
      span = 60;
      break;
    case 'DAY':
      start = now - 24 * 60 * 60;
      period = '15m';
      span = 96;
      break;
    case 'WEEK':
      start = now - 7 * 24 * 60 * 60;
      period = '2h';
      span = 84;
      break;
    case 'MONTH':
      start = now - 30 * 24 * 60 * 60;
      period = '12h';
      span = 60;
      break;
    case 'YEAR':
      start = now - 365 * 24 * 60 * 60;
      period = '1d';
      span = 365;
      break;
    case 'MAX':
      start = 0;
      period = '1d';
      span = 500;
      break;
  }

  const kyOptions = this.getKyOptions();
  const endpoint = `chart/${coinKey}?start=${start}&span=${span}&period=${period}&searchWidth=600`;

  try {
    const data = await HttpClient.get<DefiLlamaChartResponse>(
      {
        endpoint,
        ...options,
      },
      kyOptions
    );

    const coinData = data.coins[coinKey];
    if (!coinData || !coinData.prices) {
      return null;
    }

    return coinData.prices;
  } catch (error) {
    return null;
  }
}
