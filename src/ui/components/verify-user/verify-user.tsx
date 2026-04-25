import { accountPublicRPCPort } from '@/shared/channels';
import { PublicUser } from '@/shared/types/User';
import { zeroizeAfterSubmission } from '@/shared/zeroize-submission';
import { useGetExistingUser } from '@/ui/hooks/request/internal/useAccount';
import { Button, Input } from '@/ui/ui-kit';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useId, useRef, useState } from 'react';
import { Layout } from '../layout';
import { LayoutHeading } from '../layout/heading';

export function VerifyUser({
  text,
  buttonTitle = 'Unlock',
  onSuccess,
}: {
  text?: string;
  buttonTitle?: string;
  onSuccess: () => void;
}) {
  const { data: user } = useGetExistingUser();

  const loginMutation = useMutation({
    mutationFn: ({ user, password }: { user: PublicUser; password: string }) =>
      accountPublicRPCPort.request('login', { user, password }),
    onSuccess() {
      zeroizeAfterSubmission();
      onSuccess();
    },
  });

  const inputId = useId();
  const passwordRef = useRef<HTMLInputElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleSubmit = () => {
    const password = passwordRef.current?.value;
    if (!password || !user) return;
    loginMutation.mutate({ user, password });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      passwordRef.current?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="flex-1 space-y-4">
        <LayoutHeading
          title="Enter Password"
          description={text || 'Enter your password to unlock your wallet.'}
        />

        <div className="gap-1">
          <Input
            id={inputId}
            ref={passwordRef}
            type="password"
            name="password"
            placeholder="Enter password"
            size="md"
            isError={!!loginMutation.error}
            onChange={(e) => setIsEmpty(e.target.value === '')}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          {loginMutation.error && (
            <p className="text-xs text-destructive">
              {(loginMutation.error as Error).message || 'Unknown error'}
            </p>
          )}
        </div>
      </div>
      <Button
        variant="primary"
        size="md"
        disabled={isEmpty || loginMutation.isPending}
        loading={loginMutation.isPending}
        loadingText="Checking..."
        className="mt-auto"
        onClick={handleSubmit}
      >
        {buttonTitle}
      </Button>
    </>
  );
}

export function VerifyUserView({
  onBack,
  text,
  buttonTitle,
  onSuccess,
}: {
  onBack: () => void;
  text: string;
  buttonTitle: string;
  onSuccess: () => void;
}) {
  return (
    <Layout title="Enter Password" onBack={onBack} wrapped={false}>
      <VerifyUser text={text} buttonTitle={buttonTitle} onSuccess={onSuccess} />
    </Layout>
  );
}
