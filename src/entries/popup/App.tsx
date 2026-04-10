import { initialize as initializeApperance } from '@/ui/features/appearance';
import { Route, Routes } from 'react-router-dom';
import { BaseApp } from '../base/App';
import { Views } from '../base/views';

initializeApperance();

export interface AppProps {
  initialView?: 'handshakeFailure';
  inspect?: { message: string };
}

export function App(props: AppProps) {
  return (
    <BaseApp {...props}>
      <Routes>
        <Route
          path="*"
          element={
            <Views
              initialRoute={
                props.initialView === 'handshakeFailure'
                  ? '/handshake-failure'
                  : undefined
              }
            />
          }
        />
      </Routes>
    </BaseApp>
  );
}
