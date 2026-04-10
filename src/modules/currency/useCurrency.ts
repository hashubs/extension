import { preferenceStore } from '@/ui/features/appearance';
import { useStore } from '@store-unit/react';

export function useCurrency() {
  return useStore(preferenceStore) as { currency: string };
}
