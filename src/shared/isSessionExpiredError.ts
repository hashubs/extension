import { getError } from '@/shared/errors/get-error';

export function isSessionExpiredError(error: unknown) {
  return getError(error).message === 'Session expired';
}
