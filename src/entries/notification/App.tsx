import { ViewTransition } from '@/ui/components/ViewTransition/ViewTransition';
import { initialize as initializeApperance } from '@/ui/features/appearance';
import {
  ChooseGlobalProviderGuard,
  RequestAccounts,
} from '@/ui/views/request-account';
import { Navigate, Route, Routes } from 'react-router-dom';
import { BaseApp } from '../base/App';
import { RequireAuth } from '../base/auth';

import { HandshakeFailure } from '@/ui/views/handshake-failure';
import { LoginView } from '@/ui/views/login';
import { WalletSelectorView } from '@/ui/views/wallet-selector';

initializeApperance();

export interface AppProps {
  initialView?: string;
  inspect?: { message: string };
}

const animatedRoutes = ['/requestAccounts'];

export function App({ initialView, inspect }: AppProps) {
  return (
    <BaseApp bodyClassList={['overflow-hidden']} inspect={inspect}>
      <ViewTransition animatedRoutes={animatedRoutes}>
        {(location) => (
          <Routes location={location}>
            {initialView ? (
              <Route path="/" element={<Navigate to={initialView} />} />
            ) : null}
            <Route path="/login" element={<LoginView />} />
            <Route
              path="/requestAccounts"
              element={
                <RequireAuth>
                  <ChooseGlobalProviderGuard>
                    <RequestAccounts />
                  </ChooseGlobalProviderGuard>
                </RequireAuth>
              }
            />
            <Route
              path="/requestAccounts/select-wallet"
              element={
                <RequireAuth>
                  <WalletSelectorView />
                </RequireAuth>
              }
            />
            <Route path="/handshake-failure" element={<HandshakeFailure />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </ViewTransition>
    </BaseApp>
  );
}
