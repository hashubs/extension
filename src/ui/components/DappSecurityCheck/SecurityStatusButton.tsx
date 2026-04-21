import { useAnimationPreference } from '@/ui/features/appearance';
import { cn } from '@/ui/lib/utils';
import {
  alertVariants,
  iconBgVariants,
  iconColorVariants,
  titleVariants,
} from '@/ui/ui-kit/alert';
import { animated, useSpring } from '@react-spring/web';
import { createNanoEvents } from 'nanoevents';
import React, { useEffect, useState } from 'react';
import { BsShieldFillCheck } from 'react-icons/bs';
import { IoIosWarning } from 'react-icons/io';
import { PiShieldWarningDuotone } from 'react-icons/pi';
import { TiArrowSortedDown } from 'react-icons/ti';
import { useRenderDelay } from 'src/ui/components/DelayedRender/DelayedRender';
import styles from './style.module.css';

export type SecurityButtonKind =
  | 'ok'
  | 'danger'
  | 'warning'
  | 'unknown'
  | 'loading';

const KIND_TO_ALERT_VARIANT: Record<SecurityButtonKind, any> = {
  ok: 'success',
  danger: 'danger',
  warning: 'warning',
  unknown: 'neutral',
  loading: 'neutral',
};

const SECURITY_ACCENT_COLOR: Record<SecurityButtonKind, string> = {
  warning: '#eab308',
  loading: '#64748b',
  unknown: '#64748b',
  danger: '#ef4444',
  ok: '#22c55e',
};

function SecurityCheckIcon({
  kind,
  iconSize,
}: {
  kind: SecurityButtonKind;
  iconSize: number;
}) {
  const variant = KIND_TO_ALERT_VARIANT[kind];

  if (kind === 'loading') {
    return (
      <div
        className="flex items-center justify-center"
        style={{ width: iconSize, height: iconSize }}
      >
        <div
          className={styles.loadingShield}
          style={{ width: iconSize, height: iconSize }}
        >
          <div className={styles.loadingShieldInner} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        iconBgVariants({ variant }),
        'bg-transparent w-auto h-auto'
      )}
      style={{ width: iconSize, height: iconSize }}
    >
      {kind === 'ok' ? (
        <BsShieldFillCheck className={cn(iconColorVariants({ variant }))} />
      ) : kind === 'unknown' ? (
        <IoIosWarning className={cn(iconColorVariants({ variant }))} />
      ) : (
        <PiShieldWarningDuotone
          className={cn(iconColorVariants({ variant }))}
        />
      )}
    </div>
  );
}

const emitter = createNanoEvents<{
  securityStatusChange: (kind: SecurityButtonKind) => void;
}>();

export function SecurityStatusBackground() {
  const [kind, setKind] = useState<SecurityButtonKind | undefined>(undefined);
  const render = useRenderDelay(100);

  useEffect(() => {
    return emitter.on('securityStatusChange', (newKind) => {
      setKind(newKind);
    });
  }, []);

  if (!kind || !render) return null;

  return (
    <div className="absolute inset-0 flex justify-center overflow-hidden pointer-events-none">
      <div
        className={cn(styles.bgGradientSecurity, 'shrink-0 relative')}
        style={{
          width: 1000,
          height: 600,
          background: `radial-gradient(ellipse at 50% 50%, ${SECURITY_ACCENT_COLOR[kind]} 0%, transparent 50%)`,
        }}
      />
    </div>
  );
}

export function SecurityStatusButton({
  kind,
  title,
  onClick,
  size,
}: {
  kind: SecurityButtonKind;
  title: React.ReactNode;
  onClick?: () => void;
  size: 'small' | 'big';
}) {
  const { enableAnimation } = useAnimationPreference();

  const isLoading = kind === 'loading';
  const variant = KIND_TO_ALERT_VARIANT[kind];

  const style = useSpring({
    from: { transform: 'scale(1)' },
    to: { transform: isLoading ? 'scale(0.8)' : 'scale(1)' },
    config: {
      duration: isLoading ? 5000 : undefined,
      tension: isLoading ? 100 : 200,
      friction: isLoading ? 50 : 10,
    },
    immediate: !enableAnimation,
  });

  useEffect(() => {
    if (kind !== 'loading') {
      emitter.emit('securityStatusChange', kind);
    }
  }, [kind]);

  const isBig = size === 'big';

  return (
    <animated.div style={style}>
      <button
        type="button"
        className={cn(
          alertVariants({ variant }),
          'flex items-center rounded-xl w-full whitespace-nowrap border-0 backdrop-blur-none bg-transparent', // Clean base
          alertVariants({ variant }),
          'border',
          onClick ? 'cursor-pointer' : 'cursor-default',
          isBig ? 'h-14 justify-between' : 'h-10 justify-center'
        )}
        disabled={!onClick}
        onClick={onClick}
      >
        <div className={cn('flex items-center', isBig ? 'gap-3' : 'gap-1')}>
          <SecurityCheckIcon kind={kind} iconSize={isBig ? 32 : 28} />
          <span
            className={cn(
              'text-start',
              titleVariants({ variant }),
              isBig ? 'text-sm font-semibold' : 'text-xs font-semibold'
            )}
          >
            {title}
          </span>
        </div>
        {onClick ? (
          <TiArrowSortedDown
            className={cn('size-5', iconColorVariants({ variant }))}
          />
        ) : null}
      </button>
    </animated.div>
  );
}
