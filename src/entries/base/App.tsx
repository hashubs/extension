import { ProgrammaticNavigationHelper } from '@/shared/programmatic';
import { queryClient } from '@/shared/query-client/queryClient';
import { ScreenViewTracker } from '@/shared/ScreenViewTracker';
import { DesignTheme } from '@/ui/components/DesignTheme/DesignTheme';
import { InactivityDetector } from '@/ui/components/Session/InactivityDetector';
import { SessionResetHandler } from '@/ui/components/Session/SessionResetHandler';

import { VersionUpgrade } from '@/ui/components/version-upgrade';
import { initialize as initializeApperance } from '@/ui/features/appearance';
import { QueryClientProvider } from '@tanstack/react-query';
import { AreaProvider, RenderArea } from 'react-area';
import { HashRouter as Router } from 'react-router-dom';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

export interface BaseAppProps {
  bodyClassList?: string[];
  inspect?: { message: string };
  children: React.ReactNode;
}

// Initialize appearance for all entries
initializeApperance();
dayjs.extend(relativeTime);

/**
 * Shared root application component that provides all global providers
 * and orchestration for different extension views (Popup, Sidepanel).
 */
export function BaseApp({ bodyClassList, inspect, children }: BaseAppProps) {
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
          <VersionUpgrade>{children}</VersionUpgrade>
          <RenderArea name="toast-overlay" />
        </Router>
      </QueryClientProvider>
    </AreaProvider>
  );
}
