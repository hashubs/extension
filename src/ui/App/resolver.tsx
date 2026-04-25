import { useAuthState } from '../hooks/request/internal/useAuth';

export function SomeKindOfResolver({
  noUser,
  noWallet,
  notAuthenticated,
  authenticated,
}: {
  noUser: JSX.Element;
  noWallet: JSX.Element;
  notAuthenticated: JSX.Element;
  authenticated: JSX.Element;
}) {
  const { isLoading, isAuthenticated, existingUser, hasWallet } =
    useAuthState();
  if (isLoading) {
    return null;
  }
  if (!existingUser) {
    return noUser;
  }
  if (!isAuthenticated) {
    return notAuthenticated;
  }
  if (!hasWallet) {
    return noWallet;
  }
  return authenticated;
}
