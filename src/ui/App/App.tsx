import { ProgrammaticNavigationHelper } from '@/shared/programmatic';
import { queryClient } from '@/shared/query-client/queryClient';
import { ScreenViewTracker } from '@/shared/ScreenViewTracker';
import { DesignTheme } from '@/ui/components/DesignTheme/DesignTheme';
import { InactivityDetector } from '@/ui/components/Session/InactivityDetector';
import { SessionResetHandler } from '@/ui/components/Session/SessionResetHandler';

import { VersionUpgrade } from '@/ui/components/version-upgrade';
import { initialize as initializeApperance } from '@/ui/features/appearance';
import { QueryClientProvider } from '@tanstack/react-query';
import { AreaProvider } from 'react-area';
import { Route, HashRouter as Router, Routes } from 'react-router-dom';

import { getWindowType } from '@/shared/window-type';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useMemo } from 'react';
import { GlobalRoutes } from './global-routes';

import { FullPageRoutes } from './fullpage-routes';
import * as styles from './style.module.css';

export interface AppProps {
  initialView?: 'handshakeFailure';
  inspect?: { message: string };
}

// Initialize appearance for all entries
initializeApperance();
dayjs.extend(relativeTime);

/**
 * Shared root application component that provides all global providers
 * and orchestration for different extension views (Popup, Sidepanel).
 */
export function App({ inspect, initialView }: AppProps) {
  const windowType = getWindowType();

  const bodyClassList = useMemo(() => {
    const result = [];

    const isLayoutFullscreen = windowType === 'tab';
    const isLayoutSidepanel = windowType === 'sidepanel';

    if (isLayoutFullscreen) {
      result.push(styles.layoutFullscreen);
    } else if (isLayoutSidepanel) {
      result.push(styles.layoutSidepanel);
    }

    return result;
  }, [windowType]);

  return (
    <AreaProvider>
      <QueryClientProvider client={queryClient}>
        <DesignTheme bodyClassList={bodyClassList} />
        <Router>
          <ScreenViewTracker />
          <InactivityDetector />
          <SessionResetHandler />
          <ProgrammaticNavigationHelper />
          {inspect && (
            <div className="bg-gray-50 border-b border-gray-200 p-2 text-[10px] text-gray-400 font-mono">
              {inspect.message}
            </div>
          )}
          <VersionUpgrade>
            {windowType === 'tab' ? (
              <FullPageRoutes />
            ) : (
              <Routes>
                <Route
                  path="*"
                  element={
                    <GlobalRoutes
                      initialRoute={
                        initialView === 'handshakeFailure'
                          ? '/handshake-failure'
                          : undefined
                      }
                    />
                  }
                />
              </Routes>
            )}
          </VersionUpgrade>
        </Router>
      </QueryClientProvider>
    </AreaProvider>
  );
}
