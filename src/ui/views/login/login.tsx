import { accountPublicRPCPort, walletPort } from '@/shared/channel';
import { invariant } from '@/shared/invariant';
import { queryClient } from '@/shared/query-client/queryClient';
import { PublicUser } from '@/shared/types/User';
import { zeroizeAfterSubmission } from '@/shared/zeroize-submission';
import { Button, Input } from '@/ui/ui-kit';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ForgotPassword } from './forgot-password';

export function Login() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['account/getExistingUser'],
    queryFn: () => {
      return accountPublicRPCPort.request('getExistingUser');
    },
  });

  const userId = user?.id;

  const { data: lastUsedAddress } = useQuery({
    enabled: Boolean(userId),
    queryKey: ['wallet/getLastUsedAddress', userId],
    queryFn: async () => {
      invariant(userId, "user['id'] is required");
      return walletPort.request('getLastUsedAddress', { userId });
    },
  });

  const handleSuccess = useCallback(() => {
    queryClient.invalidateQueries(['authState']);
    navigate(params.get('next') || '/', { replace: true });
  }, [navigate, params]);

  const loginMutation = useMutation({
    mutationFn: async ({
      user,
      password,
    }: {
      user: PublicUser;
      password: string;
    }) => {
      return accountPublicRPCPort.request('login', { user, password });
    },
    onSuccess: async () => {
      zeroizeAfterSubmission();
      await new Promise((r) => setTimeout(r, 100));
      handleSuccess();
    },
  });

  const handleUnlock = () => {
    if (!password || !user) return;
    loginMutation.mutate({ user, password });
  };

  const subtitle = lastUsedAddress
    ? `Unlocking ${lastUsedAddress.slice(0, 6)}...${lastUsedAddress.slice(-4)}`
    : 'Enter your password to unlock';

  if (isLoading) return null;
  if (isError) throw error;
  if (!user) return <Navigate to="/" replace={true} />;

  return (
    <>
      <div className="flex flex-col justify-center h-full animate-fade-in bg-[#f8f8f8] dark:bg-[#202020]">
        <div className="flex-1 flex flex-col items-center justify-center text-center bg-[#f8f8f8] dark:bg-[#202020]">
          <div className="w-14 h-14 mb-5 rounded-2xl bg-white border border-muted flex items-center justify-center">
            <span className="text-2xl">◈</span>
          </div>
          <h2 className="text-xl font-semibold mb-1">Welcome Back</h2>
        </div>

        <div className="relative z-10 rounded-t-3xl bg-background px-8 py-10 shadow-2xl">
          <div className="flex flex-col space-y-4">
            <div className="w-full">
              <p className="text-sm text-primary mb-1.5">{subtitle}</p>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                autoFocus
                isError={!!loginMutation.error}
                size="md"
              />
              {!!loginMutation.error && (
                <p className="text-destructive-foreground text-xs mt-1.5">
                  {(loginMutation.error as Error).message ||
                    'Incorrect password'}
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <Button
                onClick={handleUnlock}
                disabled={loginMutation.isLoading || !password}
                loading={loginMutation.isLoading}
                size="sm"
                variant="solid"
                className="py-1.75"
                shimmer
              >
                Unlock
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="py-1.75"
                onClick={() => setForgotPasswordOpen(true)}
              >
                Forgot your password?
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ForgotPassword
        open={forgotPasswordOpen}
        onOpenChange={setForgotPasswordOpen}
        loading={true}
        onConfirm={() => {}}
      />
    </>
  );
}
