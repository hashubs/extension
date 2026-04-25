import { ActionType } from '@/shared/request/types/wallet-get-actions';
import { useWalletActions } from '@/ui/hooks/request/external/use-wallet-actions';
import { useMemo } from 'react';

interface UseUnifiedActivityParams {
  addresses: string[];
  chain?: string;
  fungibleId?: string;
  actionTypes?: ActionType[];
  assetTypes?: ('fungible' | 'nft')[];
  searchQuery?: string;
  initialCursor?: string;
  enabled?: boolean;
}

/**
 * useUnifiedActivity
 *
 * Server-only for now
 * and deduplicates by transaction hash.
 */
export function useUnifiedActivity(params: UseUnifiedActivityParams) {
  const serverQuery = useWalletActions(params);

  const actions = useMemo(() => {
    const seenHashes = new Set<string>();
    return (serverQuery.data?.pages.flatMap((page) => page.data) || []).filter(
      (tx) => {
        const hash = tx.transaction?.hash?.toLowerCase();
        if (!hash) return true;
        if (seenHashes.has(hash)) return false;
        seenHashes.add(hash);
        return true;
      }
    );
  }, [serverQuery.data]);

  return {
    ...serverQuery,
    actions,
  };
}
