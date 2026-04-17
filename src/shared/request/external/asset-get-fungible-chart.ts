import { invariant } from '@/shared/invariant';
import { ApiContext } from '../api-bare';
import { CLIENT_DEFAULTS, ClientOptions, HttpClient } from '../shared';
import { Payload } from '../types/payload';

export type ChartPeriod = '1h' | '1d' | '1w' | '1m' | '1y' | 'max';

export type AssetChartActionDirection = 'in' | 'out' | null;

export type AssetChartAction = {
  type: 'sell' | 'buy' | null;
  direction: AssetChartActionDirection;
  quantity: string;
  value: number;
};

export type AssetChartActions = {
  count: number;
  total: AssetChartAction;
  preview: AssetChartAction[];
};

export interface Response {
  points: Array<{
    timestamp: number;
    value: number;
    actions: AssetChartActions | null;
  }>;
}

export async function assetGetFungibleChart(
  this: ApiContext,
  params: Payload,
  options: ClientOptions = CLIENT_DEFAULTS
) {
  invariant(params.addresses.length > 0, 'Addresses param is empty');
  const kyOptions = this.getKyOptions();
  const endpoint = '/asset/fungible/chart';
  return await HttpClient.post<Response>(
    {
      endpoint,
      body: JSON.stringify(params),
      ...options,
    },
    kyOptions
  );
}
