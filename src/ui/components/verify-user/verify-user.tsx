import { accountPublicRPCPort } from '@/shared/channel';
import { PublicUser } from '@/shared/types/User';
import { zeroizeAfterSubmission } from '@/shared/zeroize-submission';
import { useGetExistingUser } from '@/ui/hooks/request/internal/useAccount';
import { Button, Input } from '@/ui/ui-kit';
import { useMutation } from '@tanstack/react-query';
import React, { useId, useRef, useState } from 'react';
import { Header } from '../header';

export function VerifyUser({
  text,
  buttonTitle = 'Unlock',
  onSuccess,
}: {
  text?: React.ReactNode;
  buttonTitle?: React.ReactNode;
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

  return (
    <div className="flex-1 flex flex-col h-full p-4 pt-0 space-y-4">
      <div className="gap-2">
        <h1 className="text-2xl font-medium">Enter Password</h1>
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>

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
    </div>
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
    <div className="flex flex-col h-full">
      <Header title="Enter Password" onBack={onBack} />

      <VerifyUser text={text} buttonTitle={buttonTitle} onSuccess={onSuccess} />
    </div>
  );
}
