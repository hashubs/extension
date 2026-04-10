import { invariant } from '@/shared/invariant';
import { Payload } from '@/shared/youno-api/types/payload';
import type { ClientOptions } from '../shared';
import { CLIENT_DEFAULTS, YounoHttpClient } from '../shared';
import type { YounoApiContext } from '../youno-api-bare';

export interface Identity {
  provider: 'ens' | 'lens' | 'ud' | 'unspecified';
  address: string;
  handle: string;
}

export interface WalletMeta {
  address: string;
  identities: Identity[];
}

interface Response {
  data: WalletMeta[];
}

export async function getWalletsMeta(
  this: YounoApiContext,
  params: Payload,
  options: ClientOptions = CLIENT_DEFAULTS
) {
  invariant(params.addresses.length > 0, 'Addresses param is empty');
  const kyOptions = this.getKyOptions();
  const endpoint = '/wallet/meta/identifiers';
  return await YounoHttpClient.post<Response>(
    {
      endpoint,
      body: JSON.stringify(params),
      ...options,
    },
    kyOptions
  );
}
