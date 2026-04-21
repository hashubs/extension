import { walletPort } from '@/shared/channel';
import { useToastStore } from '@/shared/store/useToastStore';
import { useMutation } from '@tanstack/react-query';

export function useClearPendingTransactions() {
  const { show: showToast } = useToastStore();
  const { mutate: clearPendingTransactions, ...mutation } = useMutation({
    mutationFn: async () => {
      await new Promise((r) => setTimeout(r, 500));
      return walletPort.request('clearPendingTransactions');
    },
    onSuccess: () => {
      showToast('Pending transactions cleared');
    },
  });
  return { clearPendingTransactions, ...mutation };
}
