import { useAnimationPreference } from '@/ui/features/appearance';
import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  type Location,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import styles from './ViewTransition.module.css';

export type TransitionAnimation = 'slide' | 'scaleUp';

export interface CustomTransition {
  from: string;
  to: string;
  animation: TransitionAnimation;
}

interface ViewTransitionProps {
  children: (location: Location) => React.ReactNode;
  animatedRoutes?: string[];
  excludedTransitions?: Array<{ from: string; to: string }>;
  customTransitions?: Array<CustomTransition>;
}

interface LayerState {
  location: Location;
  id: number;
  animClass: string;
  zIndex: number;
}

const DUR = 380;
let idCounter = 0;

export function ViewTransition({
  children,
  animatedRoutes = [],
  excludedTransitions = [],
  customTransitions = [],
}: ViewTransitionProps) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const { enableAnimation } = useAnimationPreference();

  const [layers, setLayers] = useState<LayerState[]>([
    {
      location,
      id: idCounter++,
      animClass: '',
      zIndex: 2,
    },
  ]);

  const busyRef = useRef(false);
  const prevPathRef = useRef(location.pathname);
  const isMountedRef = useRef(false);

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

  const getCustomAnimation = (
    from: string,
    to: string
  ): TransitionAnimation | null => {
    const nFrom = normalizePath(from);
    const nTo = normalizePath(to);
    const match = customTransitions.find((t) => {
      const exFrom = normalizePath(t.from);
      const exTo = normalizePath(t.to);
      const matchesFrom =
        nFrom === exFrom || (exFrom !== '/' && nFrom.startsWith(exFrom + '/'));
      const matchesTo =
        nTo === exTo || (exTo !== '/' && nTo.startsWith(exTo + '/'));
      return matchesFrom && matchesTo;
    });
    return match?.animation ?? null;
  };

  const getDepth = (path: string) => path.split('/').filter(Boolean).length;

  const computeDirection = (prev: string, next: string): 'forward' | 'back' => {
    if (navigationType === 'POP') return 'back';
    const state = location.state as {
      direction?: 'back' | 'forward';
    } | null;
    if (state?.direction === 'back') return 'back';
    if (state?.direction === 'forward') return 'forward';
    return getDepth(next) >= getDepth(prev) ? 'forward' : 'back';
  };

  useLayoutEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }

    const prevPath = prevPathRef.current;
    const nextPath = location.pathname;

    if (prevPath === nextPath) return;
    if (busyRef.current) return;

    const shouldAnimate =
      enableAnimation &&
      !isExcludedTransition(prevPath, nextPath) &&
      (animatedRoutes.length === 0 ||
        matchesRoute(nextPath) ||
        matchesRoute(prevPath));

    prevPathRef.current = nextPath;

    if (!shouldAnimate) {
      setLayers([
        {
          location,
          id: idCounter++,
          animClass: '',
          zIndex: 2,
        },
      ]);
      return;
    }

    busyRef.current = true;
    const nextId = idCounter++;
    const customAnim = getCustomAnimation(prevPath, nextPath);

    if (customAnim === 'scaleUp') {
      // Current layer scales down and fades out, new layer scales up from center
      setLayers((prev) => {
        const current = prev[prev.length - 1];
        return [
          { ...current, animClass: styles.animScaleOut, zIndex: 1 },
          {
            location,
            id: nextId,
            animClass: styles.animScaleIn,
            zIndex: 2,
          },
        ];
      });
    } else {
      // Default slide animation
      const direction = computeDirection(prevPath, nextPath);

      if (direction === 'forward') {
        setLayers((prev) => {
          const current = prev[prev.length - 1];
          return [
            { ...current, animClass: styles.animPushOut, zIndex: 1 },
            {
              location,
              id: nextId,
              animClass: styles.animPushIn,
              zIndex: 2,
            },
          ];
        });
      } else {
        setLayers((prev) => {
          const current = prev[prev.length - 1];
          const below = prev[prev.length - 2];
          if (!below) {
            return [
              { ...current, animClass: styles.animPopOut, zIndex: 2 },
              {
                location,
                id: nextId,
                animClass: styles.animPopIn,
                zIndex: 1,
              },
            ];
          }
          return [
            { ...below, location, animClass: styles.animPopIn, zIndex: 1 },
            { ...current, animClass: styles.animPopOut, zIndex: 2 },
          ];
        });
      }
    }

    setTimeout(() => {
      setLayers([
        {
          location,
          id: nextId,
          animClass: '',
          zIndex: 2,
        },
      ]);
      busyRef.current = false;
    }, DUR + 20);
  }, [location.pathname]);

  return (
    <div className={styles.container}>
      {layers.map((layer) => (
        <div
          key={layer.id}
          className={`${styles.layer} ${layer.animClass}`}
          style={{ zIndex: layer.zIndex }}
        >
          {children(layer.location)}
        </div>
      ))}
    </div>
  );
}
