import { invariant } from '@/shared/invariant';
import { Payload } from '@/shared/request/types/payload';
import type { ApiContext } from '../api-bare';
import type { ClientOptions } from '../shared';
import { CLIENT_DEFAULTS, HttpClient } from '../shared';

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

export async function walletGetMetadata(
  this: ApiContext,
  params: Payload,
  options: ClientOptions = CLIENT_DEFAULTS
) {
  invariant(params.addresses.length > 0, 'Addresses param is empty');
  const kyOptions = this.getKyOptions();
  const endpoint = '/wallet/meta/identifiers';
  return await HttpClient.post<Response>(
    {
      endpoint,
      body: JSON.stringify(params),
      ...options,
    },
    kyOptions
  );
}
