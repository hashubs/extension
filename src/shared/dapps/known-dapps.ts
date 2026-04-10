import { data } from './dapps-list.data';

export const knownDappOrigins = new Set(
  data.map((entry) => new URL(entry.url).origin)
);

export function isKnownDapp({ origin }: { origin: string }) {
  return knownDappOrigins.has(origin);
}
