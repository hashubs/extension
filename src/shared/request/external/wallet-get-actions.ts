import { produce } from 'immer';
import { ApiContext } from '../api-bare';
import { CLIENT_DEFAULTS, ClientOptions, HttpClient } from '../shared';
import { Payload } from '../types/payload';
import { Action } from '../types/wallet-get-actions';

export interface Response {
  data: Action[];
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
  const kyOptions = this.getKyOptions();
  const endpoint = '/wallet/activity';
  const result = await HttpClient.post<Response>(
    {
      endpoint,
      body: JSON.stringify(params),
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
