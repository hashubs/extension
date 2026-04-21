import { Navigate, useLocation } from 'react-router-dom';

import { usePrefetchNetworks } from '@/ui/hooks/request/internal/useNetworks';
import { usePrefetchWalletGroups } from '@/ui/hooks/request/internal/useWallet';
import { useEffect } from 'react';
import { useAuthState } from '../hooks/request/internal/useAuth';

function AuthenticatedDataWrapper({ children }: { children: JSX.Element }) {
  usePrefetchWalletGroups();

  const prefetchNetworks = usePrefetchNetworks();
  useEffect(() => {
    prefetchNetworks();
  }, [prefetchNetworks]);

  return children;
}

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

  return <AuthenticatedDataWrapper>{children}</AuthenticatedDataWrapper>;
}
