import { walletPort } from '@/shared/channel';
import { PopoverToastHandle } from '@/ui/components/toast/PopoverToast';
import { useMutation } from '@tanstack/react-query';
import { useRef } from 'react';

export function useClearPendingTransactions() {
  const toastRef = useRef<PopoverToastHandle>(null);
  const { mutate: clearPendingTransactions, ...mutation } = useMutation({
    mutationFn: async () => {
      await new Promise((r) => setTimeout(r, 500));
      toastRef.current?.removeToast();
      return walletPort.request('clearPendingTransactions');
    },
    onSuccess: () => {
      toastRef.current?.showToast();
    },
  });
  return { clearPendingTransactions, toastRef, ...mutation };
}
