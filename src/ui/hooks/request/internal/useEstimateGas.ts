import { estimateGas } from '@/modules/ethereum/transactions/fetchAndAssignGasPrice';
import type { IncomingTransaction } from '@/modules/ethereum/types/IncomingTransaction';
import { useNetworks } from '@/ui/hooks/request/internal/useNetworks';
import { useQuery } from '@tanstack/react-query';

export function useEstimateGas(transaction: IncomingTransaction | null) {
  const { networks } = useNetworks();
  return useQuery({
    queryKey: ['estimateGas', transaction, networks],
    queryFn: () =>
      networks && transaction ? estimateGas(transaction, networks) : null,
    enabled: Boolean(networks && transaction),
  });
}
