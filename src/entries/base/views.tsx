import { queryClient } from '@/shared/query-client/queryClient';
import { RouteRestoration } from '@/shared/RouteRestoration';
import { getWindowType } from '@/shared/window-type';
import { HandshakeFailure } from '@/ui/components/HandshakeFailure/HandshakeFailure';
import { ViewArea } from '@/ui/components/ViewArea/ViewArea';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { LoginView } from '@/ui/Views/LoginView';
import { Overview } from '@/ui/Views/overview/overview';
import { RequireAuth } from './auth';
import { SomeKindOfResolver } from './resolver';

function DefiSdkClientProvider({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

export function Views({ initialRoute }: { initialRoute?: string }) {
  const isPopup = getWindowType() === 'popup';
  return (
    <DefiSdkClientProvider>
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
                noUser={<Navigate to="/login" replace={true} />}
                noWallet={<Navigate to="/login" replace={true} />}
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
                <Overview />
              </RequireAuth>
            }
          />
          <Route path="/handshake-failure" element={<HandshakeFailure />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ViewArea>
    </DefiSdkClientProvider>
  );
}
