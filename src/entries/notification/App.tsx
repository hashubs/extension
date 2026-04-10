import { initialize as initializeApperance } from '@/ui/features/appearance';
import { HandshakeFailure } from '@/ui/Views/HandshakeFailure';
import {
  ChooseGlobalProviderGuard,
  RequestAccounts,
} from '@/ui/Views/request-account';
import { Navigate, Route, Routes } from 'react-router-dom';
import { BaseApp } from '../base/App';
import { RequireAuth } from '../base/auth';

initializeApperance();

export interface AppProps {
  initialView?: string;
  inspect?: { message: string };
}

export function App({ initialView, inspect }: AppProps) {
  return (
    <BaseApp bodyClassList={[]} inspect={inspect}>
      <>
        <Routes>
          {initialView ? (
            <Route path="/" element={<Navigate to={initialView} />} />
          ) : null}
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
          <Route
            path="*"
            element={<Navigate to="/requestAccounts" replace />}
          />
        </Routes>
      </>
    </BaseApp>
  );
}
