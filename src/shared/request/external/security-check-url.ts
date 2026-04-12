import type { ApiContext } from '../api-bare';
import type { ClientOptions } from '../shared';
import { HttpClient } from '../shared';

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
  this: ApiContext,
  payload: Params,
  options?: ClientOptions
) {
  const params = new URLSearchParams({ url: payload.url });
  const kyOptions = this.getKyOptions();
  const endpoint = `security/check?${params}`;
  return HttpClient.get<Response>({ endpoint, ...options }, kyOptions);
}
