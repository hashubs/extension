import { BrowserStorage } from '@/background/webapis/storage';
import { ApiClient } from '@/shared/request/api.client';
import {
  CrawlTokenImagesParams,
  CrawlTokenImagesResponse,
} from '@/shared/request/external/crawl-token-images';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

const KEY_CRAWLED_TOKENS = 'selvo:crawled_tokens';
const KEY_CRAWLED_WALLETS = 'selvo:crawled_wallets';

async function getCrawledTokens(): Promise<Set<string>> {
  const data = (await BrowserStorage.get(KEY_CRAWLED_TOKENS)) as Record<
    string,
    any
  >;
  return new Set(data[KEY_CRAWLED_TOKENS] || []);
}

async function saveCrawledTokens(tokens: Set<string>) {
  await BrowserStorage.set(KEY_CRAWLED_TOKENS, Array.from(tokens));
}

async function getCrawledWallets(): Promise<Set<string>> {
  const data = (await BrowserStorage.get(KEY_CRAWLED_WALLETS)) as Record<
    string,
    any
  >;
  return new Set(data[KEY_CRAWLED_WALLETS] || []);
}

async function saveCrawledWallets(wallets: Set<string>) {
  await BrowserStorage.set(KEY_CRAWLED_WALLETS, Array.from(wallets));
}

export function useCrawlTokenImages(
  options?: UseMutationOptions<
    CrawlTokenImagesResponse,
    Error,
    CrawlTokenImagesParams
  >
) {
  return useMutation({
    mutationFn: async (params: CrawlTokenImagesParams) => {
      const { chainIds, tokens, walletAddress } = params;

      if (walletAddress) {
        const crawledWallets = await getCrawledWallets();
        const walletKey = walletAddress.toLowerCase();

        if (crawledWallets.has(walletKey)) {
          return { ok: true };
        }

        const response = await ApiClient.crawlTokenImages({ walletAddress });

        if (response.ok) {
          crawledWallets.add(walletKey);
          await saveCrawledWallets(crawledWallets);
        }

        return response;
      }

      if (chainIds && chainIds.length > 0 && tokens && tokens.length > 0) {
        const crawledTokens = await getCrawledTokens();
        let hasNewCombo = false;

        outerLoop: for (const chainId of chainIds) {
          for (const token of tokens) {
            if (!crawledTokens.has(`${chainId}:${token.toLowerCase()}`)) {
              hasNewCombo = true;
              break outerLoop;
            }
          }
        }

        if (!hasNewCombo) {
          return { ok: true };
        }

        const response = await ApiClient.crawlTokenImages({
          chainIds,
          tokens,
        });

        if (response.ok) {
          chainIds.forEach((chainId) => {
            tokens.forEach((token) => {
              crawledTokens.add(`${chainId}:${token.toLowerCase()}`);
            });
          });
          await saveCrawledTokens(crawledTokens);
        }

        return response;
      }

      return { ok: true };
    },
    ...options,
  });
}
