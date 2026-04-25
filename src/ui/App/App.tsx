import { ProgrammaticNavigationHelper } from '@/shared/programmatic';
import { queryClient } from '@/shared/query-client/queryClient';
import { ScreenViewTracker } from '@/shared/ScreenViewTracker';
import { DesignTheme } from '@/ui/components/DesignTheme/DesignTheme';
import { InactivityDetector } from '@/ui/components/Session/InactivityDetector';
import { SessionResetHandler } from '@/ui/components/Session/SessionResetHandler';

import { VersionUpgrade } from '@/ui/components/version-upgrade';
import {
  initialize as initializeApperance,
  useApplyGlobalAnimationClass,
} from '@/ui/features/appearance';
import { QueryClientProvider } from '@tanstack/react-query';
import { AreaProvider } from 'react-area';
import { Route, HashRouter as Router, Routes } from 'react-router-dom';

import { urlContext } from '@/shared/UrlContext';
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
  const { isFullPage } = urlContext;
  const isOnboardingMode = urlContext.appMode === 'onboarding';
  const isPageLayout = urlContext.windowLayout === 'page' || isFullPage;

  const bodyClassList = useMemo(() => {
    const result = [];

    const isDialog = urlContext.windowType === 'dialog';
    const isTab = urlContext.windowType === 'tab';
    const isSidepanel = urlContext.windowType === 'sidepanel';

    if (isDialog) {
      result.push(styles.isDialog);
    } else if (isTab) {
      result.push(styles.isTab);
    } else if (isSidepanel) {
      result.push(styles.isSidepanel);
    }

    if (isOnboardingMode || isPageLayout) {
      result.push(styles.pageLayout);
    }
    return result;
  }, [isOnboardingMode, isPageLayout]);

  useApplyGlobalAnimationClass();

  const isOnboardingView =
    isOnboardingMode && initialView !== 'handshakeFailure';

  const isFullPageView = isFullPage && !isOnboardingView;

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
            {isOnboardingView ? (
              <FullPageRoutes />
            ) : isFullPageView ? (
              <Routes>
                <Route
                  path="*"
                  element={
                    <div className="flex h-full items-center justify-center p-10 text-center">
                      <div className="max-w-md space-y-4">
                        <h1 className="text-4xl font-bold">Dashboard</h1>
                        <p className="text-muted-foreground">
                          Halaman dashboard utama (Dexscreener style) sedang
                          dalam pengembangan. Akses melalui popup untuk dompet
                          Anda.
                        </p>
                      </div>
                    </div>
                  }
                />
              </Routes>
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
