import type { ClientOptions } from '../shared';
import { YounoHttpClient } from '../shared';
import type { YounoApiContext } from '../youno-api-bare';

interface Params {
  url: string;
}

interface Response {
  data: {
    maliciousScore: number;
    flags: {
      isMalicious: boolean;
    };
  } | null;
}

export function securityCheckUrl(
  this: YounoApiContext,
  payload: Params,
  options?: ClientOptions
) {
  const params = new URLSearchParams({ url: payload.url });
  const kyOptions = this.getKyOptions();
  const endpoint = `security/check?${params}`;
  return YounoHttpClient.get<Response>({ endpoint, ...options }, kyOptions);
}
