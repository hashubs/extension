import { accountPublicRPCPort } from '@/shared/channel';
import { SessionExpired } from '@/shared/errors/errors';
import { Header } from '@/ui/components/header';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VerifyUser } from './verify-user';

export function WithPasswordSession({
  text,
  children,
  buttonTitle,
}: React.PropsWithChildren<{ text?: React.ReactNode; buttonTitle?: string }>) {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['passwordSessionData'],
    queryFn: async () => {
      const [hasActivePasswordSession, isPendingNewUser] = await Promise.all([
        accountPublicRPCPort.request('hasActivePasswordSession'),
        accountPublicRPCPort.request('isPendingNewUser'),
      ]);
      return { hasActivePasswordSession, isPendingNewUser };
    },
  });
  const [verified, setVerified] = useState(false);
  if (isLoading || !data) {
    return null;
  }
  const { hasActivePasswordSession, isPendingNewUser } = data;
  if (!hasActivePasswordSession && isPendingNewUser) {
    // When there is a pending user (CreateAccount flow), it's complicated
    // to know which user object to verify (one in local storage or one in memory),
    // it is much more robust to throw the user out of the flow entirely.
    throw new SessionExpired();
  }

  if (!hasActivePasswordSession && !verified) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Enter Password" onBack={() => navigate(-1)} />

        <VerifyUser
          text={text}
          buttonTitle={buttonTitle}
          onSuccess={() => setVerified(true)}
        />
      </div>
    );
  } else {
    return children as JSX.Element;
  }
}
