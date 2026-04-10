import { invariant } from '@/shared/invariant';
import {
  CLIENT_DEFAULTS,
  YounoHttpClient,
  type ClientOptions,
} from '../shared';

import { Payload } from '@/shared/youno-api/types/payload';
import { YounoApiContext } from '../youno-api-bare';

export type ActivityData = Record<
  string,
  { active: boolean; totalValue: number }
>;

export interface Response {
  data: ActivityData;
}

export async function walletGetAddressActivity(
  this: YounoApiContext,
  params: Payload,
  options: ClientOptions = CLIENT_DEFAULTS
) {
  invariant(params.addresses.length > 0, 'Addresses param is empty');
  const kyOptions = this.getKyOptions();
  const endpoint = '/wallet/address/activity';
  return await YounoHttpClient.post<Response>(
    {
      endpoint,
      body: JSON.stringify(params),
      ...options,
    },
    kyOptions
  );
}
