import { animated, useTransition } from '@react-spring/web';
import React, { useRef } from 'react';
import {
  type Location,
  useLocation,
  useNavigationType,
} from 'react-router-dom';

interface ViewTransitionProps {
  children: (location: Location) => React.ReactNode;
  animatedRoutes?: string[];
  excludedTransitions?: Array<{ from: string; to: string }>;
}

export function ViewTransition({
  children,
  animatedRoutes = [],
  excludedTransitions = [],
}: ViewTransitionProps) {
  const location = useLocation();
  const navigationType = useNavigationType();

  const prevPathRef = useRef(location.pathname);
  const isBackRef = useRef(false);
  const shouldAnimateRef = useRef(false);
  const isMountedRef = useRef(false);

  const getDepth = (path: string) => path.split('/').filter(Boolean).length;

  const normalizePath = (path: string) =>
    path === '/' ? path : path.replace(/\/$/, '');

  const matchesRoute = (path: string) => {
    if (animatedRoutes.length === 0) return true;
    const normalized = normalizePath(path);
    return animatedRoutes.some((route) => {
      const normalizedRoute = normalizePath(route);
      return (
        normalized === normalizedRoute ||
        normalized.startsWith(normalizedRoute + '/')
      );
    });
  };

  const isExcludedTransition = (from: string, to: string) => {
    const nFrom = normalizePath(from);
    const nTo = normalizePath(to);
    return excludedTransitions.some((t) => {
      const exFrom = normalizePath(t.from);
      const exTo = normalizePath(t.to);
      const matchesFrom =
        nFrom === exFrom || (exFrom !== '/' && nFrom.startsWith(exFrom + '/'));
      const matchesTo =
        nTo === exTo || (exTo !== '/' && nTo.startsWith(exTo + '/'));
      return matchesFrom && matchesTo;
    });
  };

  const prevPath = prevPathRef.current;

  const computeDirection = (): 'back' | 'forward' => {
    const state = location.state as { direction?: 'back' | 'forward' } | null;
    if (state?.direction === 'back') return 'back';
    if (state?.direction === 'forward') return 'forward';
    if (navigationType === 'POP') return 'back';
    return getDepth(location.pathname) >= getDepth(prevPath)
      ? 'forward'
      : 'back';
  };

  const isBack = computeDirection() === 'back';

  const shouldAnimate =
    isMountedRef.current &&
    prevPath !== location.pathname &&
    !isExcludedTransition(prevPath, location.pathname) &&
    (animatedRoutes.length === 0 ||
      matchesRoute(location.pathname) ||
      matchesRoute(prevPath));

  shouldAnimateRef.current = shouldAnimate;
  isBackRef.current = isBack;

  React.useLayoutEffect(() => {
    isMountedRef.current = true;
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  const transitions = useTransition(location, {
    key: location.pathname,

    initial: null,

    from: () => {
      if (!shouldAnimateRef.current) return { transform: 'translateX(0%)' };
      return {
        transform: isBackRef.current ? 'translateX(-100%)' : 'translateX(100%)',
        opacity: 0,
      };
    },

    enter: () => ({
      transform: 'translateX(0%)',
      opacity: 1,
      zIndex: 2,
    }),

    leave: () => {
      if (!shouldAnimateRef.current)
        return { transform: 'translateX(0%)', zIndex: 1 };
      return {
        transform: isBackRef.current ? 'translateX(100%)' : 'translateX(-30%)',
        opacity: 0,
        zIndex: 1,
      };
    },

    config: { tension: 280, friction: 26 },
    immediate: (key) => key === 'zIndex',
    exitBeforeEnter: false,
  });

  return (
    <div
      id="view-transition-container"
      style={{
        position: 'relative',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      }}
      className="bg-background"
    >
      {transitions((style, item) => (
        <animated.div
          key={item.key}
          style={{
            ...style,
            position: 'absolute',
            inset: 0,
            backgroundColor: 'inherit',
            willChange: 'transform, opacity',
          }}
        >
          {children(item)}
        </animated.div>
      ))}
    </div>
  );
}
