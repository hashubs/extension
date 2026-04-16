import { ApiContext } from '../api-bare';
import { ClientOptions, HttpClient } from '../shared';

export interface CrawlTokenImagesParams {
  chainIds?: string[];
  tokens?: string[];
  walletAddress?: string;
}

export interface CrawlTokenImagesResponse {
  ok: boolean;
  error?: string;
}

export function crawlTokenImages(
  this: ApiContext,
  payload: CrawlTokenImagesParams,
  options: ClientOptions = { source: 'crawler' }
) {
  const kyOptions = this.getKyOptions();
  const endpoint = 'provide';
  return HttpClient.post<CrawlTokenImagesResponse>(
    {
      endpoint,
      body: JSON.stringify(payload),
      ...options,
    },
    kyOptions
  );
}
