import { PLATFORM } from '@/env/config';

export const ORIGIN_PROTOCOL =
  PLATFORM === 'chrome' ? 'chrome-extension:' : 'moz-extension:';
