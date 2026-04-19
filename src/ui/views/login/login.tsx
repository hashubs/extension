import { accountPublicRPCPort, walletPort } from '@/shared/channel';
import { invariant } from '@/shared/invariant';
import { queryClient } from '@/shared/query-client/queryClient';
import { PublicUser } from '@/shared/types/User';
import { wait } from '@/shared/wait';
import { zeroizeAfterSubmission } from '@/shared/zeroize-submission';
import { BlockieAddress } from '@/ui/components/blockie';
import { BrandLogo } from '@/ui/components/svg';
import { Button, Input } from '@/ui/ui-kit';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { RiLockPasswordLine } from 'react-icons/ri';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatedBackground } from './components/AnimatedBackground';
import { ForgotPassword } from './forgot-password';
import { LoginPasskey } from './login-passkey';

export function LoginView() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['account/getExistingUser'],
    queryFn: () => accountPublicRPCPort.request('getExistingUser'),
  });

  const { data: lastUsedAddress } = useQuery({
    enabled: Boolean(user?.id),
    queryKey: ['wallet/getLastUsedAddress', user?.id],
    queryFn: async () => {
      await wait(500);
      invariant(user?.id, "user['id'] is required");
      return walletPort.request('getLastUsedAddress', { userId: user.id });
    },
  });

  const handleSuccess = useCallback(() => {
    navigate(params.get('next') || '/', {
      // If user clicks "back" when we redirect them,
      // we should take them to overview, not back to the login view
      replace: true,
    });
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
      setUnlocked(true);
      await wait(100);
      queryClient.invalidateQueries({ queryKey: ['authState'] });
      handleSuccess();
    },
  });

  const handleUnlock = () => {
    if (!password || !user) return;
    loginMutation.mutate({ user, password });
  };

  return (
    <>
      <div className="flex flex-col h-full bg-[#f8f8f8] dark:bg-[#202020] overflow-hidden relative">
        <div className="flex-1 relative flex items-center justify-center min-h-[280px] overflow-hidden bg-[#f8f8f8] dark:bg-[#202020]">
          <AnimatedBackground show={!!lastUsedAddress} />

          <div className="relative z-10 flex flex-col items-center gap-4">
            {lastUsedAddress ? (
              <BlockieAddress
                address={lastUsedAddress}
                size={95}
                borderRadius={8}
              />
            ) : (
              <BrandLogo
                size={95}
                className="shadow-[0_8px_32px_rgba(0,0,0,0.25)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              />
            )}

            <div className="text-center">
              <p className="text-[22px] font-bold text-[#202020] dark:text-white tracking-tight transition-opacity duration-300">
                {unlocked ? "You're in!" : 'Welcome Back!'}
              </p>
              <p className="text-[13px] text-black/40 dark:text-white/40 mt-1 transition-opacity duration-300">
                {unlocked ? 'Redirecting…' : 'Enter password to unlock'}
              </p>
            </div>
          </div>
        </div>

        <div className="relative px-8 pt-10 pb-4 z-10 rounded-t-3xl bg-background border-t border-muted-foreground/10 shadow-2xl">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            isError={!!loginMutation.error}
            size="lg"
            placeholder="Password"
            autoFocus={!isLoading}
            leftIcon={RiLockPasswordLine}
          />
          {!!loginMutation.error && (
            <p className="text-[#D4577A] text-xs mt-1.5">
              {(loginMutation.error as Error).message || 'Incorrect password'}
            </p>
          )}

          <div className="flex flex-col mt-4">
            <Button
              onClick={handleUnlock}
              loading={loginMutation.isPending}
              loadingText="Unlocking…"
              size="md"
              variant="primary"
              className="py-1.75"
              shimmer
            >
              Unlock
            </Button>
            <LoginPasskey user={user || undefined} onSuccess={handleSuccess} />
            <Button
              variant="blank"
              size="md"
              className="py-1.75 mt-2"
              onClick={() => setForgotPasswordOpen(true)}
            >
              Need Help?
            </Button>
          </div>
        </div>
      </div>

      <ForgotPassword
        open={forgotPasswordOpen}
        onOpenChange={setForgotPasswordOpen}
        loading={false}
        onConfirm={() => {}}
      />
    </>
  );
}
