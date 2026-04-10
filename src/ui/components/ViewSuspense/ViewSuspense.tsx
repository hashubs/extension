import React from 'react';

export function ViewSuspense({
  children,
  fallback,
}: React.PropsWithChildren<{
  logDelays?: boolean;
  fallback?: React.ReactNode;
}>) {
  return (
    <React.Suspense
      fallback={
        fallback ?? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white w-full h-full">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center animate-pulse mb-4">
              <span className="text-xl font-black text-blue-600">Y</span>
            </div>
          </div>
        )
      }
    >
      {children}
    </React.Suspense>
  );
}
