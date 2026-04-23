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
import { AddWalletRoutes } from '@/ui/views/add-wallet';
import { BackupWalletRoutes } from '@/ui/views/backup-wallet';
import { CreateWalletRoutes } from '@/ui/views/create-wallet';
import { ImportWalletRoutes } from '@/ui/views/import-wallet';
import { RevealPrivateKeyRoutes } from '@/ui/views/reveal-private-key';
import { SettingsRoutes } from '@/ui/views/settings';
import { TestView } from '@/ui/views/tests/test-view';
import { GlobalToast } from '../components/toast/GlobalToast';
import {
  ChooseGlobalProviderGuard,
  RequestAccounts,
} from '../views/request-account';
import {
  RestoreDataView,
  useRedirectToRestoreView,
} from '../views/restore-data';

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

const excludedTransitions = [
  { from: '/', to: '/overview' },
  { from: '/login', to: '/overview' },
  {
    from: '/settings/manage-wallets/reveal-private-key',
    to: '/settings/manage-wallets/reveal-private-key/view',
  },
  {
    from: '/settings/manage-wallets/backup',
    to: '/settings/manage-wallets/backup/mnemonic',
  },
  {
    from: '/add-wallet',
    to: '/add-wallet/scan',
  },
  {
    from: '/add-wallet/scan',
    to: '/add-wallet/discovery',
  },
  {
    from: '/create-wallet',
    to: '/create-wallet/select-ecosystem',
  },
  {
    from: '/create-wallet/select-ecosystem',
    to: '/create-wallet/verify',
  },
  {
    from: '/create-wallet/verify',
    to: '/create-wallet/generate',
  },
  {
    from: '/backup-wallet',
    to: '/backup-wallet/mnemonic',
  },
  {
    from: '/backup-wallet/mnemonic',
    to: '/backup-wallet/verify',
  },
  {
    from: '/backup-wallet/verify',
    to: '/backup-wallet/success',
  },
  {
    from: '/reveal-private-key',
    to: '/reveal-private-key/view',
  },
  {
    from: '/import-wallet',
    to: '/import-wallet/mnemonic/verify',
  },
  {
    from: '/import-wallet/mnemonic/verify',
    to: '/import-wallet/mnemonic/scan',
  },
  {
    from: '/import-wallet/mnemonic/scan',
    to: '/import-wallet/mnemonic/discovery',
  },
];

export function GlobalRoutes({ initialRoute }: { initialRoute?: string }) {
  useRedirectToRestoreView();
  const isPopup = getWindowType() === 'popup';
  return (
    <DefiSdkClientProvider>
      {isPopup ? <RouteRestoration /> : null}
      <ViewTransition
        animatedRoutes={animatedRoutes}
        excludedTransitions={excludedTransitions}
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
              <Route path="/restore-data" element={<RestoreDataView />} />
              <Route path="/test-view" element={<TestView />} />
              <Route path="/handshake-failure" element={<HandshakeFailure />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          );
        }}
      </ViewTransition>
      <GlobalToast />
    </DefiSdkClientProvider>
  );
}
