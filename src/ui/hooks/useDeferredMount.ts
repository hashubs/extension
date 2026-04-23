import { useEffect, useState } from 'react';

export function useDeferredMount(delayMs = 320) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), delayMs);
    return () => clearTimeout(id);
  }, []);

  return ready;
}
