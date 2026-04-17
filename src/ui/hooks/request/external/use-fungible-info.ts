import { ApiClient } from '@/shared/request/api.client';
import { FungibleInfo } from '@/shared/request/external/asset-get-fungible-info';
import { useQuery } from '@tanstack/react-query';

interface Params {
  id: string;
  enabled?: boolean;
}

export function useFungibleInfo({ id, enabled = true }: Params) {
  return useQuery<FungibleInfo>({
    queryKey: ['asset/fungible-info', id],
    queryFn: async () => {
      const res = await ApiClient.assetGetFungibleInfo(id);
      return res.data;
    },
    enabled: enabled && !!id,
    staleTime: 30_000,
  });
}
