import { useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { BaseApp } from '../base/App';
import { Views } from '../base/views';
import * as styles from './style.module.css';

export interface AppProps {
  initialView?: 'handshakeFailure';
  inspect?: { message: string };
}

export function App(props: AppProps) {
  const bodyClassList = useMemo(() => [styles.layoutSidepanel], []);
  return (
    <BaseApp bodyClassList={bodyClassList} {...props}>
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
