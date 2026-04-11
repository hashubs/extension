import { ProgrammaticNavigationHelper } from '@/shared/programmatic';
import { queryClient } from '@/shared/query-client/queryClient';
import { ScreenViewTracker } from '@/shared/ScreenViewTracker';
import { DesignTheme } from '@/ui/components/DesignTheme/DesignTheme';
import { InactivityDetector } from '@/ui/components/Session/InactivityDetector';
import { ViewSuspense } from '@/ui/components/ViewSuspense/ViewSuspense';
import { initialize as initializeApperance } from '@/ui/features/appearance';
import { QueryClientProvider } from '@tanstack/react-query';
import { AreaProvider } from 'react-area';
import { HashRouter as Router } from 'react-router-dom';

export interface BaseAppProps {
  bodyClassList?: string[];
  inspect?: { message: string };
  children: React.ReactNode;
}

// Initialize appearance for all entries
initializeApperance();

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
          <ProgrammaticNavigationHelper />
          <ViewSuspense logDelays={true}>
            {inspect && (
              <div className="bg-gray-50 border-b border-gray-200 p-2 text-[10px] text-gray-400 font-mono">
                {inspect.message}
              </div>
            )}
            {children}
          </ViewSuspense>
        </Router>
      </QueryClientProvider>
    </AreaProvider>
  );
}
