import { EXTENSION } from '@/app/constants';
import { invariant } from '@/shared/invariant';
import { Payload } from '@/shared/request/types/payload';
import { AddressAction } from '@/shared/request/types/wallet-get-actions';
import { produce } from 'immer';
import type { ApiContext } from '../api-bare';
import type { ClientOptions } from '../shared';
import { CLIENT_DEFAULTS, HttpClient } from '../shared';

export interface Response {
  data: AddressAction[];
  meta: {
    pagination: {
      /**
       * @description Cursor can contain any type of information; clients should not rely on its contents, but should simply send it as it is. // [!code link {"token":"Cursor","href":"/docs/actions/entities.html#cursor"}]
       * @example 10
       */
      cursor: string;
    };
  } | null;
  errors?: { title: string; detail: string }[];
}

export async function walletGetActions(
  this: ApiContext,
  params: Payload,
  options: ClientOptions = CLIENT_DEFAULTS
) {
  invariant(params.addresses.length > 0, 'Addresses param is empty');
  const firstAddress = params.addresses[0];
  const provider = await this.getAddressProviderHeader(firstAddress);
  const kyOptions = this.getKyOptions();
  const endpoint = 'wallet/get-actions/v1';
  const result = await HttpClient.post<Response>(
    {
      endpoint,
      body: JSON.stringify(params),
      headers: { [`${EXTENSION.slug}-wallet-provider`]: provider },
      ...options,
    },
    kyOptions
  );
  return produce(result, (draft) => {
    draft.data.forEach((action) => {
      action.timestamp = action.timestamp * 1000;
    });
  });
}
