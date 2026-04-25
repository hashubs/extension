import { walletPort } from '@/shared/channels';
import { useMutation } from '@tanstack/react-query';

export function useRemovePermissionMutation({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  return useMutation({
    mutationFn: ({ origin, address }: { origin: string; address?: string }) => {
      return walletPort.request('removePermission', { origin, address });
    },
    onSuccess,
  });
}
