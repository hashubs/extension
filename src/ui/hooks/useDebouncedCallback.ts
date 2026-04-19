import { useEffect, useMemo, useRef } from 'react';
import debounce from 'lodash/debounce';

export function useDebouncedCallback<T extends any[], K>(
  callback: (...args: T) => K,
  delay: number
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(
    () => debounce((...args: T) => callbackRef.current(...args), delay),
    [delay]
  );

  useEffect(() => {
    return () => {
      debouncedCallback.cancel();
    };
  }, [debouncedCallback]);

  return debouncedCallback;
}
