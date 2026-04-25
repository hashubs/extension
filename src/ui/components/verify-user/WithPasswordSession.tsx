import { accountPublicRPCPort } from '@/shared/channels';
import { SessionExpired } from '@/shared/errors/errors';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../layout';
import { VerifyUser } from './verify-user';

export function WithPasswordSession({
  text,
  children,
  buttonTitle,
}: React.PropsWithChildren<{ text?: string; buttonTitle?: string }>) {
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
      <Layout
        title="Enter Password"
        onBack={() => navigate(-1)}
        wrapped={false}
      >
        <VerifyUser
          text={text}
          buttonTitle={buttonTitle}
          onSuccess={() => setVerified(true)}
        />
      </Layout>
    );
  } else {
    return children as JSX.Element;
  }
}
