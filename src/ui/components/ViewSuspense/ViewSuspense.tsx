import { emitter } from '@/shared/events';
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DelayedRender, useRenderDelay } from '../DelayedRender/DelayedRender';
import { ViewLoading } from '../view-loading/view-loading';

function DelayLogger() {
  const { pathname } = useLocation();
  const logSmallDelay = useRenderDelay(3000);
  const logLongDelay = useRenderDelay(8000);

  useEffect(() => {
    if (logSmallDelay) {
      emitter.emit('loaderScreenView', {
        location: pathname,
        duration: 3000,
      });
    }
  }, [logSmallDelay, pathname]);

  useEffect(() => {
    if (logLongDelay) {
      emitter.emit('loaderScreenView', {
        location: pathname,
        duration: 8000,
      });
    }
  }, [logLongDelay, pathname]);

  return null;
}

export function ViewSuspense({
  children,
  fallback,
  logDelays = true,
}: React.PropsWithChildren<{
  logDelays?: boolean;
  fallback?: React.ReactNode;
}>) {
  return (
    <React.Suspense
      fallback={
        <>
          {fallback ?? (
            <DelayedRender>
              <ViewLoading />
            </DelayedRender>
          )}
          {logDelays ? <DelayLogger /> : null}
        </>
      }
    >
      {children}
    </React.Suspense>
  );
}
