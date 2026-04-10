import { useOnboardingSession } from '@/ui/hooks/useOnboardingSession';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CreateRoute } from './create';
import { CreateWalletProvider } from './create/create-context';
import { ImportRoute, ImportWalletProvider } from './import';
import { PageLayout } from './layout';
import { Oops } from './oops';
import { ShareData } from './share-data';
import { Success } from './success';
import { PannelRight } from './success/pannel-right';
import { Welcome } from './welcome';

import { ONBOARDING_ROUTES } from './routes';

export function Onboarding() {
  const { sessionDataIsLoading } = useOnboardingSession({
    navigateOnExistingUser: ONBOARDING_ROUTES.SESSION_EXPIRED,
  });

  if (sessionDataIsLoading) {
    return null;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={ONBOARDING_ROUTES.WELCOME} replace />}
      />
      <Route
        path={ONBOARDING_ROUTES.SHARE_DATA}
        element={
          <PageLayout>
            <ShareData />
          </PageLayout>
        }
      />
      <Route
        path={ONBOARDING_ROUTES.WELCOME}
        element={
          <PageLayout>
            <Welcome />
          </PageLayout>
        }
      />
      <Route
        path={`${ONBOARDING_ROUTES.CREATE.ROOT}/*`}
        element={
          <CreateWalletProvider>
            <CreateRoute />
          </CreateWalletProvider>
        }
      />
      <Route
        path={`${ONBOARDING_ROUTES.IMPORT.ROOT}/*`}
        element={
          <ImportWalletProvider>
            <ImportRoute />
          </ImportWalletProvider>
        }
      />
      <Route
        path="hardware/*"
        element={
          // For hardware wallet, we don't use PageLayout (full-screen custom)
          <>{/* <Hardware /> */}</>
        }
      />
      <Route
        path={ONBOARDING_ROUTES.SUCCESS}
        element={
          <PageLayout customRightPanel={<PannelRight />}>
            <Success />
          </PageLayout>
        }
      />
      <Route
        path={ONBOARDING_ROUTES.SESSION_EXPIRED}
        element={
          <PageLayout>
            <Oops />
          </PageLayout>
        }
      />
    </Routes>
  );
}
