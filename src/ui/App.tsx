import { accountPublicRPCPort, walletPort } from '@/shared/channel';
import { runtimeStore } from '@/shared/core/runtime-store';
import { queryClient } from '@/shared/query-client/queryClient';
import { RouteRestoration } from '@/shared/RouteRestoration';
import { ScreenViewTracker } from '@/shared/ScreenViewTracker';
import { urlContext } from '@/shared/url-context';
import { useBodyStyle } from '@/ui/components/Background/Background';
import { DesignTheme } from '@/ui/components/DesignTheme/DesignTheme';
import { HandshakeFailure } from '@/ui/components/HandshakeFailure/HandshakeFailure';
import { InactivityDetector } from '@/ui/components/Session/InactivityDetector';
import { SessionResetHandler } from '@/ui/components/Session/SessionResetHandler';
import {
  UIContext,
  defaultUIContextValue,
} from '@/ui/components/UIContext/UIContext';
import { ViewArea } from '@/ui/components/ViewArea/ViewArea';
import { ViewSuspense } from '@/ui/components/ViewSuspense/ViewSuspense';
import { initialize as initializeApperance } from '@/ui/features/appearance';
import { ProgrammaticNavigationHelper } from '@/ui/shared/routing/ProgrammaticNavigationHelper';
import * as styles from '@/ui/styles/global.module.css';
import { Onboarding } from '@/ui/Views/onboarding/onboarding';
import { useStore } from '@store-unit/react';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { AreaProvider } from 'react-area';
import {
  Navigate,
  Route,
  HashRouter as Router,
  Routes,
  useLocation,
} from 'react-router-dom';

import { LoginView } from './Views/LoginView';
import { Overview } from './Views/overview/overview';
import { PhishingWarningPage } from './Views/phishing-warning';
import {
  ChooseGlobalProviderGuard,
  RequestAccounts,
} from './Views/request-account';

function DefiSdkClientProvider({ children }: React.PropsWithChildren) {
  // Stub for structural match
  return <>{children}</>;
}

const useAuthState = () => {
  const { data, isFetching } = useQuery({
    queryKey: ['authState'],
    queryFn: async () => {
      const [isAuthenticated, existingUser, wallet] = await Promise.all([
        accountPublicRPCPort.request('isAuthenticated'),
        accountPublicRPCPort.request('getExistingUser'),
        walletPort.request('uiGetCurrentWallet'),
      ]);
      return {
        isAuthenticated,
        existingUser,
        wallet,
      };
    },
    useErrorBoundary: true,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const { isAuthenticated, existingUser, wallet } = data || {};
  return {
    isAuthenticated,
    existingUser,
    hasWallet: Boolean(wallet),
    isLoading: isFetching,
  };
};

function SomeKindOfResolver({
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

function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const { isLoading, isAuthenticated, existingUser } = useAuthState();

  if (isLoading) {
    return null;
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

  return children;
}

// TODO: Temporary views for page layout
function PageLayoutViews() {
  return (
    <Routes>
      <Route
        path="*"
        element={
          <div className="p-8 text-center text-gray-400">
            Page Layout Not Implemented
          </div>
        }
      />
    </Routes>
  );
}

function Views({ initialRoute }: { initialRoute?: string }) {
  const isPopup = urlContext.windowType === 'popup';
  return (
    <ViewArea
      data-testid="view-area"
      className="bg-background text-primary shadow-xl overflow-hidden relative"
    >
      {isPopup ? <RouteRestoration /> : null}
      <Routes>
        {initialRoute ? (
          <Route path="/" element={<Navigate to={initialRoute} />} />
        ) : null}
        <Route
          path="/"
          element={
            <SomeKindOfResolver
              noUser={<Navigate to="/onboarding/welcome" replace={true} />}
              noWallet={<Navigate to="/onboarding/welcome" replace={true} />}
              notAuthenticated={<Navigate to="/login" replace={true} />}
              authenticated={<Navigate to="/overview" replace={true} />}
            />
          }
        />
        <Route
          path="/login"
          element={
            <LoginView
              onAuthenticated={() =>
                queryClient.invalidateQueries(['authState'])
              }
            />
          }
        />
        <Route
          path="/overview/*"
          element={
            <RequireAuth>
              {/* <DashboardView
                onLogout={() => queryClient.invalidateQueries(['authState'])}
              /> */}
              <Overview />
            </RequireAuth>
          }
        />
        <Route
          path="/requestAccounts"
          element={
            <ChooseGlobalProviderGuard>
              <RequireAuth>
                <RequestAccounts />
              </RequireAuth>
            </ChooseGlobalProviderGuard>
          }
        />
        <Route path="/handshake-failure" element={<HandshakeFailure />} />
        <Route path="/phishing-warning" element={<PhishingWarningPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ViewArea>
  );
}

initializeApperance();

export interface AppProps {
  initialView?: 'handshakeFailure';
  inspect?: { message: string };
}

export function App({ initialView, inspect }: AppProps) {
  const isOnboardingMode = urlContext.appMode === 'onboarding';
  const isPageLayout = urlContext.windowLayout === 'page';

  const bodyClassList = useMemo(() => {
    const result = [];

    const isDialog = urlContext.windowType === 'dialog';
    const isTab = urlContext.windowType === 'tab';
    const isSidepanel = urlContext.windowType === 'sidepanel';

    if (isDialog) {
      result.push(styles.isDialog);
    } else if (isTab) {
      result.push(styles.isTab);
    } else if (isSidepanel) {
      result.push(styles.isSidepanel);
    }
    if (isOnboardingMode || isPageLayout) {
      result.push(styles.pageLayout);
    }
    return result;
  }, [isOnboardingMode, isPageLayout]);

  const { connected } = useStore(runtimeStore);

  useBodyStyle(
    useMemo(() => ({ opacity: connected ? '' : '0.6' }), [connected])
  );

  const isOnboardingView =
    isOnboardingMode && initialView !== 'handshakeFailure';

  return (
    <AreaProvider>
      <UIContext.Provider value={defaultUIContextValue}>
        <QueryClientProvider client={queryClient}>
          <DesignTheme bodyClassList={bodyClassList} />

          <Router>
            <ScreenViewTracker />
            <InactivityDetector />
            <SessionResetHandler />
            <ProgrammaticNavigationHelper />
            <ViewSuspense logDelays={true}>
              {inspect && (
                <div className="bg-gray-50 border-b border-gray-200 p-2 text-[10px] text-gray-400 font-mono">
                  {inspect.message}
                </div>
              )}
              <Routes>
                <Route
                  path="*"
                  element={
                    isOnboardingView ? (
                      <Onboarding />
                    ) : isPageLayout ? (
                      <PageLayoutViews />
                    ) : (
                      <DefiSdkClientProvider>
                        <Views
                          initialRoute={
                            initialView === 'handshakeFailure'
                              ? '/handshake-failure'
                              : undefined
                          }
                        />
                      </DefiSdkClientProvider>
                    )
                  }
                />
              </Routes>
            </ViewSuspense>
          </Router>
        </QueryClientProvider>
      </UIContext.Provider>
    </AreaProvider>
  );
}
