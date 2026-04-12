import { accountPublicRPCPort, walletPort } from '@/shared/channel';
import { useQuery } from '@tanstack/react-query';
import { Navigate, useLocation } from 'react-router-dom';

export const useAuthState = () => {
  const { data, isFetching } = useQuery({
    queryKey: ['authState'],
    queryFn: async () => {
      const [isAuthenticated, existingUser, wallet] = await Promise.all([
        accountPublicRPCPort.request('isAuthenticated'),
        accountPublicRPCPort.request('getExistingUser'),
        walletPort.request('uiGetCurrentWallet'),
      ]);
      return { isAuthenticated, existingUser, wallet };
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
  const { isAuthenticated, existingUser, wallet } = data || {};
  return {
    isAuthenticated,
    existingUser,
    hasWallet: Boolean(wallet),
    isLoading: isFetching,
  };
};

export function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const { isAuthenticated, existingUser } = useAuthState();

  if (existingUser === undefined || isAuthenticated === undefined) {
    return <div className="h-full w-full bg-background" />;
  }

  if (!existingUser) {
    return <Navigate to="/" replace={true} />;
  } else if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(
          `${location.pathname}${location.search}`
        )}`}
        replace={true}
      />
    );
  }

  return children;
}
