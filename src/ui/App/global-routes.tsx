import { RouteRestoration } from '@/shared/RouteRestoration';
import { urlContext } from '@/shared/UrlContext';
import {
  CustomTransition,
  ViewTransition,
} from '@/ui/components/ViewTransition/ViewTransition';
import { ActionsRoutes } from '@/ui/views/actions';
import { AddWalletRoutes } from '@/ui/views/add-wallet';
import { BackupWalletRoutes } from '@/ui/views/backup-wallet';
import { CreateWalletRoutes } from '@/ui/views/create-wallet';
import { FungibleInfoView } from '@/ui/views/fungible-info';
import { HandshakeFailure } from '@/ui/views/handshake-failure';
import { ImportWalletRoutes } from '@/ui/views/import-wallet';
import { LoginView } from '@/ui/views/login';
import { NetworkSelectorView } from '@/ui/views/network-selector';
import { NotFoundView } from '@/ui/views/not-found';
import { Overview } from '@/ui/views/overview';
import { RevealPrivateKeyRoutes } from '@/ui/views/reveal-private-key';
import { SettingsRoutes } from '@/ui/views/settings';
import { TestView } from '@/ui/views/tests/test-view';
import { WalletSelectorView } from '@/ui/views/wallet-selector';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { GlobalToast } from '../components/toast/GlobalToast';
import { AddEthereumChain } from '../views/add-ethereum-chain';
import {
  ChooseGlobalProviderGuard,
  RequestAccounts,
} from '../views/request-account';
import {
  RestoreDataView,
  useRedirectToRestoreView,
} from '../views/restore-data';
import { RequireAuth } from './auth';
import { SomeKindOfResolver } from './resolver';

function DefiSdkClientProvider({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

const animatedRoutes = [
  '/overview',
  '/actions',
  '/settings',
  '/import-wallet',
  '/add-wallet',
  '/backup-wallet',
  '/create-wallet',
  '/reveal-private-key',
];

const excludedTransitionsFor404 = [
  { from: '/overview', to: '*' },
  { from: '/settings', to: '*' },
  { from: '/actions', to: '*' },
  { from: '*', to: '/overview' },
  { from: '*', to: '/settings' },
  { from: '*', to: '/actions' },
];

const excludedTransitions = [
  { from: '/', to: '/overview' },
  { from: '/login', to: '/overview' },
];

const customTransitions = [
  {
    from: '/import-wallet/mnemonic/verify',
    to: '/import-wallet/mnemonic/discovery',
    animation: 'scaleUp' as const,
  },
  {
    from: '/add-wallet',
    to: '/add-wallet/discovery',
    animation: 'scaleUp' as const,
  },
] satisfies CustomTransition[];

export function GlobalRoutes({ initialRoute }: { initialRoute?: string }) {
  useRedirectToRestoreView();
  const isPopup = urlContext.windowType === 'popup';
  return (
    <DefiSdkClientProvider>
      {isPopup ? <RouteRestoration /> : null}
      <ViewTransition
        animatedRoutes={animatedRoutes}
        excludedTransitions={[
          ...excludedTransitions,
          ...excludedTransitionsFor404,
        ]}
        customTransitions={customTransitions}
      >
        {(location) => {
          console.log('[GlobalRoutes] Active Path:', location.pathname);
          return (
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
                path="/reveal-private-key/*"
                element={
                  <RequireAuth>
                    <RevealPrivateKeyRoutes />
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
              <Route
                path="/add-wallet/*"
                element={
                  <RequireAuth>
                    <AddWalletRoutes />
                  </RequireAuth>
                }
              />
              <Route
                path="/backup-wallet/*"
                element={
                  <RequireAuth>
                    <BackupWalletRoutes />
                  </RequireAuth>
                }
              />
              <Route
                path="/create-wallet/*"
                element={
                  <RequireAuth>
                    <CreateWalletRoutes />
                  </RequireAuth>
                }
              />
              <Route
                path="/import-wallet/*"
                element={
                  <RequireAuth>
                    <ImportWalletRoutes />
                  </RequireAuth>
                }
              />
              <Route
                path="/request-accounts"
                element={
                  <RequireAuth>
                    <ChooseGlobalProviderGuard>
                      <RequestAccounts />
                    </ChooseGlobalProviderGuard>
                  </RequireAuth>
                }
              />
              <Route
                path="/addEthereumChain/*"
                element={
                  <RequireAuth>
                    <AddEthereumChain />
                  </RequireAuth>
                }
              />
              <Route path="/restore-data" element={<RestoreDataView />} />
              <Route path="/test-view" element={<TestView />} />
              <Route path="/handshake-failure" element={<HandshakeFailure />} />
              <Route path="*" element={<NotFoundView />} />
            </Routes>
          );
        }}
      </ViewTransition>
      <GlobalToast />
    </DefiSdkClientProvider>
  );
}
