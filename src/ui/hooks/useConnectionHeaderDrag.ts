import { BrowserStorage } from '@/background/webapis/storage';
import { useSpring } from '@react-spring/web';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export const CONNECTION_HEADER_HEIGHT = 55;

export function useConnectionHeaderDrag({
  enabled = true,
}: { enabled?: boolean } = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const isDragging = useRef(false);
  const startPointerY = useRef(0);
  const startSpringY = useRef(0);
  const hasMoved = useRef(false);

  const [{ y }, api] = useSpring(
    {
      y: isOpen ? 0 : -CONNECTION_HEADER_HEIGHT,
      config: { tension: 350, friction: 35 },
      immediate: (key) => key === 'y' && isDragging.current,
    },
    [isOpen]
  );

  useEffect(() => {
    if (!enabled || isOpen) return;

    let mounted = true;
    const triggerHint = async () => {
      const hasSeen = await BrowserStorage.get<boolean>(
        'HAS_SEEN_DRAG_REVEAL_HINT'
      );
      if (hasSeen || !mounted) return;

      await new Promise((resolve) => setTimeout(resolve, 800));
      if (!mounted || isDragging.current || isOpen) return;

      api.start({
        to: async (next) => {
          await next({ y: -0, config: { tension: 180, friction: 12 } });
          await next({ y: -55, config: { tension: 300, friction: 20 } });
        },
      });

      await BrowserStorage.set('HAS_SEEN_DRAG_REVEAL_HINT', true);
    };

    triggerHint();
    return () => {
      mounted = false;
    };
  }, [enabled, api]);

  useLayoutEffect(() => {
    if (!isDragging.current) {
      api.start({
        y: isOpen ? 0 : -CONNECTION_HEADER_HEIGHT,
        immediate: false,
      });
    }
  }, [isOpen, api]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!enabled) return;

      if (
        (e.target as HTMLElement).closest(
          'button, a, input, select, [role="button"]'
        )
      )
        return;

      isDragging.current = true;
      hasMoved.current = false;
      startPointerY.current = e.clientY;
      startSpringY.current = y.get();

      api.stop();
      e.currentTarget.setPointerCapture(e.pointerId);

      if (e.cancelable) e.preventDefault();
    },
    [enabled, y, api]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!isDragging.current) return;

      const delta = e.clientY - startPointerY.current;
      if (Math.abs(delta) > 3) hasMoved.current = true;
      if (!hasMoved.current) return;

      const nextY = Math.max(
        -CONNECTION_HEADER_HEIGHT,
        Math.min(0, startSpringY.current + delta)
      );

      api.start({ y: nextY });
    },
    [api]
  );

  const settle = useCallback(
    (e?: React.PointerEvent<HTMLElement>) => {
      if (!isDragging.current) return;
      isDragging.current = false;

      if (!hasMoved.current) return;

      const currentY = y.get();
      const delta = e ? e.clientY - startPointerY.current : 0;

      const isFlickDown = delta > 15;
      const isFlickUp = delta < -15;
      const pastMidpoint = currentY > -CONNECTION_HEADER_HEIGHT / 2;

      const shouldOpen = isOpen
        ? !isFlickUp && pastMidpoint
        : isFlickDown || pastMidpoint;

      setIsOpen(shouldOpen);
      api.start({
        y: shouldOpen ? 0 : -CONNECTION_HEADER_HEIGHT,
        immediate: false,
      });
    },
    [isOpen, y, api]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      settle(e);
    },
    [settle]
  );

  const handlePointerCancel = useCallback(() => {
    settle();
  }, [settle]);

  const dragHandlers = useMemo(
    () => ({
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      style: {
        touchAction: 'none' as const,
        userSelect: 'none' as const,
      },
    }),
    [
      handlePointerDown,
      handlePointerMove,
      handlePointerUp,
      handlePointerCancel,
      enabled,
    ]
  );

  return { y, dragHandlers, isOpen };
}
