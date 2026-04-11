import { RouteRestoration } from '@/shared/RouteRestoration';
import { getWindowType } from '@/shared/window-type';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from './auth';
import { SomeKindOfResolver } from './resolver';

import { WalletSelect } from '@/ui/components/wallet';
import { HandshakeFailure } from '@/ui/views/handshake-failure';
import { Login } from '@/ui/views/login';
import { Overview } from '@/ui/views/overview/overview';

function DefiSdkClientProvider({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

export function Views({ initialRoute }: { initialRoute?: string }) {
  const isPopup = getWindowType() === 'popup';
  return (
    <DefiSdkClientProvider>
      {isPopup ? <RouteRestoration /> : null}
      <Routes>
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
        <Route path="/login" element={<Login />} />
        <Route
          path="/overview/*"
          element={
            <RequireAuth>
              <Overview />
            </RequireAuth>
          }
        />
        <Route
          path="/select-wallet"
          element={
            <RequireAuth>
              <WalletSelect />
            </RequireAuth>
          }
        />
        <Route path="/handshake-failure" element={<HandshakeFailure />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DefiSdkClientProvider>
  );
}
