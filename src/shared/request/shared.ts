import { EXTENSION } from '@/app/constants';
import { API_URL, TESTNET_API_URL } from '@/env/config';
import { platform } from '@/shared/analytics/platform';
import { createUrl } from '@/shared/create-url';
import { invariant } from '@/shared/invariant';
import { version } from '@/shared/package-version';
import ky, { type Options as KyOptions } from 'ky';

export type NetworksSource = 'mainnet' | 'testnet';

export interface BackendSourceParams {
  source: NetworksSource;
}

type UrlInput =
  | ({ endpoint: string } & Partial<BackendSourceParams>)
  | { url: string | URL };

type GetOptions = UrlInput;
type PostOptions = UrlInput & { body: BodyInit };

export type Options = {
  headers?: Record<string, string | undefined>;
};

export type ClientOptions = Options & BackendSourceParams;

export const CLIENT_DEFAULTS: ClientOptions = { source: 'mainnet' };

export function createHeaders(options: Options) {
  return {
    'X-Request-Id': crypto.randomUUID(),
    [`${EXTENSION.slug}-client-type`]: platform,
    [`${EXTENSION.slug}-client-version`]: version,
    'Content-Type': 'application/json',
    ...options.headers,
  };
}

const resolveUrl = (input: UrlInput): string | URL => {
  if ('url' in input) {
    invariant(input.url, 'url param must be a string');
    return input.url;
  } else {
    const { endpoint, source = 'mainnet' } = input;
    invariant(endpoint, 'endpoint param must be a string');
    const base = source === 'testnet' ? TESTNET_API_URL : API_URL;
    invariant(
      base,
      `One of API URLs not found in env: ${TESTNET_API_URL}, ${API_URL}`
    );
    return createUrl({ base, pathname: endpoint });
  }
};

export class HttpClient {
  static get<T>(options: GetOptions & Options, kyOptions: KyOptions) {
    const url = resolveUrl(options);
    return ky
      .get(url, {
        headers: createHeaders(options),
        credentials: 'include',
        ...kyOptions,
      })
      .json<T>();
  }

  static post<T>(options: PostOptions & Options, kyOptions: KyOptions) {
    const url = resolveUrl(options);
    const { body } = options;
    return ky
      .post(url, {
        body,
        headers: createHeaders(options),
        credentials: 'include',
        ...kyOptions,
      })
      .json<T>();
  }
}
