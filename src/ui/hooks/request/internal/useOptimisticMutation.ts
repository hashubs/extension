import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useOptimisticMutation<Args, Res, QueryType = unknown>(
  mutationFn: (variables: Args) => Promise<Res>,
  {
    relatedQueryKey: queryKey,
    onMutate,
  }: {
    relatedQueryKey: string[];
    onMutate?: (info: { client: QueryClient; variables: Args }) => unknown;
  }
) {
  type OptimisticContext = { previous?: QueryType };
  const client = useQueryClient();
  return useMutation<Res, Error, Args, OptimisticContext>({
    mutationFn,
    onMutate: async (variables): Promise<OptimisticContext> => {
      await client.cancelQueries({ queryKey });
      const previous = client.getQueryData<QueryType | undefined>(queryKey);
      onMutate?.({ client, variables });
      return { previous };
    },
    onError: (_err, _args, context) => {
      if (context?.previous !== undefined) {
        client.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => client.invalidateQueries({ queryKey }),
  });
}
