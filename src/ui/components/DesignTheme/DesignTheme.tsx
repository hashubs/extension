import { useLayoutEffect } from 'react';

// Note: simplified without module imports for now as they don't exist yet
export function DesignTheme({
  bodyClassList = [],
}: {
  bodyClassList?: string[];
}) {
  useLayoutEffect(() => {
    if (bodyClassList?.length) {
      document.body.classList.add(...bodyClassList);
      return () => {
        document.body.classList.remove(...bodyClassList);
      };
    }
  }, [bodyClassList]);
  return null;
}
