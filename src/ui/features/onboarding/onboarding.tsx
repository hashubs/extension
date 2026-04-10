import { useOnboardingSession } from '@/ui/hooks/useOnboardingSession';
import { Route, Routes } from 'react-router-dom';
import { CreateRoute } from './create';
import { CreateWalletProvider } from './create/create-context';
import { ImportRoute, ImportWalletProvider } from './import';
import { PageLayout } from './layout';
import { Oops } from './oops';
import { ShareData } from './share-data';
import { Success } from './success';
import { PannelRight } from './success/pannel-right';
import { Welcome } from './welcome';

export function Onboarding() {
  const { sessionDataIsLoading } = useOnboardingSession({
    navigateOnExistingUser: 'session-expired',
  });

  if (sessionDataIsLoading) {
    return null;
  }

  return (
    <Routes>
      <Route
        path="/onboarding"
        element={
          <PageLayout>
            <ShareData />
          </PageLayout>
        }
      />
      <Route
        path="/onboarding/welcome"
        element={
          <PageLayout>
            <Welcome />
          </PageLayout>
        }
      />
      <Route
        path="/onboarding/create/*"
        element={
          <CreateWalletProvider>
            <CreateRoute />
          </CreateWalletProvider>
        }
      />
      <Route
        path="/onboarding/import/*"
        element={
          <ImportWalletProvider>
            <ImportRoute />
          </ImportWalletProvider>
        }
      />
      <Route
        path="/onboarding/hardware/*"
        element={
          // For hardware wallet, we don't use PageLayout (full-screen custom)
          <>{/* <Hardware /> */}</>
        }
      />
      <Route
        path="/onboarding/success"
        element={
          <PageLayout customRightPanel={<PannelRight />}>
            <Success />
          </PageLayout>
        }
      />
      <Route
        path="/onboarding/session-expired"
        element={
          <PageLayout>
            <Oops />
          </PageLayout>
        }
      />
    </Routes>
  );
}
