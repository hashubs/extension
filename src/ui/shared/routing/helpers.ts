import { emitter } from '@/shared/events';

export function navigateProgrammatically(params: { pathname: string }) {
  emitter.emit('navigationRequest', params);
}
