import { accountPublicRPCPort } from '@/shared/channel';
import { useQuery } from '@tanstack/react-query';

export const GET_EXISTING_USER_QUERY_KEY = ['account/getExistingUser'];

export function useGetExistingUser() {
  return useQuery({
    queryKey: GET_EXISTING_USER_QUERY_KEY,
    queryFn: () => accountPublicRPCPort.request('getExistingUser'),
  });
}
