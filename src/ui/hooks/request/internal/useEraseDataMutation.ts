import { accountPublicRPCPort } from '@/shared/channels';
import type { MutateOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

export function useEraseDataMutation(options: MutateOptions) {
  return useMutation({
    mutationFn: async () => {
      // artificial delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return accountPublicRPCPort.request('eraseAllData');
    },
    ...options,
  });
}
