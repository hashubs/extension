import { ensureSupportedPlatform, type Platform } from '@/shared/platform';

export const GOOGLE_ANALYTICS_API_SECRET =
  process.env.GOOGLE_ANALYTICS_API_SECRET || '';
export const GOOGLE_ANALYTICS_MEASUREMENT_ID =
  process.env.GOOGLE_ANALYTICS_MEASUREMENT_ID || '';
export const STATSIG_API_KEY = process.env.STATSIG_API_KEY || '';
export const PROXY_URL = process.env.PROXY_URL || 'https://proxy.youno.id';
export const API_URL =
  process.env.API_URL || 'https://wallet-server-v1.hashubs.workers.dev';
export const TESTNET_API_URL =
  process.env.TESTNET_API_URL || 'https://testnet.youno.id';
export const SLOW_MODE = false;
export const CRAWLER_API_URL =
  process.env.CRAWLER_API_URL ||
  'https://crawl-token-images.hashubs.workers.dev';
export const DEFILLAMA_API_URL =
  process.env.DEFILLAMA_API_URL || 'https://coins.llama.fi';
export const PLATFORM = (process.env.PLATFORM || 'chrome') as Platform;
ensureSupportedPlatform(PLATFORM);
