import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { RouteRestoration } from '@/shared/RouteRestoration';
import { getWindowType } from '@/shared/window-type';
import { ViewTransition } from '@/ui/components/ViewTransition/ViewTransition';
import { RequireAuth } from './auth';
import { SomeKindOfResolver } from './resolver';

import { HandshakeFailure } from '@/ui/views/handshake-failure';
import { LoginView } from '@/ui/views/login';
import { NetworkSelectorView } from '@/ui/views/network-selector';
import { Overview } from '@/ui/views/overview';
import { WalletSelectorView } from '@/ui/views/wallet-selector';

import { ActionsRoutes } from '@/ui/views/actions';
import { FungibleInfoView } from '@/ui/views/fungible-info';
import { SettingsRoutes } from '@/ui/views/settings';
import { TestView } from '@/ui/views/tests/test-view';

function DefiSdkClientProvider({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

const animatedRoutes = ['/overview', '/actions', '/settings'];

const excludedTransitions = [
  { from: '/', to: '/overview' },
  { from: '/login', to: '/overview' },
];

export function Views({ initialRoute }: { initialRoute?: string }) {
  const isPopup = getWindowType() === 'popup';
  return (
    <DefiSdkClientProvider>
      {isPopup ? <RouteRestoration /> : null}
      <ViewTransition
        animatedRoutes={animatedRoutes}
        excludedTransitions={excludedTransitions}
      >
        {(location) => (
          <Routes location={location}>
            {initialRoute ? (
              <Route path="/" element={<Navigate to={initialRoute} />} />
            ) : null}
            <Route
              path="/"
              element={
                <SomeKindOfResolver
                  noUser={<Navigate to="/login" replace={true} />}
                  noWallet={<Navigate to="/login" replace={true} />}
                  notAuthenticated={<Navigate to="/login" replace={true} />}
                  authenticated={<Navigate to="/overview" replace={true} />}
                />
              }
            />
            <Route path="/login" element={<LoginView />} />
            <Route
              path="/overview/*"
              element={
                <RequireAuth>
                  <Overview />
                </RequireAuth>
              }
            />
            <Route
              path="/fungible/:id"
              element={
                <RequireAuth>
                  <FungibleInfoView />
                </RequireAuth>
              }
            />
            <Route
              path="/select-wallet"
              element={
                <RequireAuth>
                  <WalletSelectorView />
                </RequireAuth>
              }
            />
            <Route
              path="/select-network"
              element={
                <RequireAuth>
                  <NetworkSelectorView />
                </RequireAuth>
              }
            />
            <Route
              path="/actions/*"
              element={
                <RequireAuth>
                  <ActionsRoutes />
                </RequireAuth>
              }
            />
            <Route
              path="/settings/*"
              element={
                <RequireAuth>
                  <SettingsRoutes />
                </RequireAuth>
              }
            />
            <Route path="/test-view" element={<TestView />} />
            <Route path="/handshake-failure" element={<HandshakeFailure />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </ViewTransition>
    </DefiSdkClientProvider>
  );
}
