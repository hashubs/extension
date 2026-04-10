import { useTransformTrigger } from '@/ui/hooks/useTransformTrigger';
import { animated } from '@react-spring/web';
import { useLayoutEffect } from 'react';
import { FaCheckCircle, FaRegCheckCircle } from 'react-icons/fa';

export function AnimatedCheckmark({
  animate = true,
  checked,
  checkedColor,
  uncheckedColor = 'var(--neutral-400)',
  tickColor,
  size,
}: {
  animate?: boolean;
  checked: boolean;
  checkedColor: string;
  uncheckedColor?: string;
  tickColor?: string;
  size?: number;
}) {
  const { style, trigger } = useTransformTrigger({
    scale: 1.15,
    timing: 100,
  });
  useLayoutEffect(() => {
    if (!animate) {
      return;
    }
    if (checked) {
      trigger();
    }
  }, [animate, checked, trigger]);
  if (!checked) {
    return (
      <div>
        <FaRegCheckCircle
          size={size}
          style={{ display: 'block', color: uncheckedColor }}
        />
      </div>
    );
  } else {
    return (
      <animated.div style={style}>
        <FaCheckCircle
          size={size}
          style={Object.assign(
            { display: 'block', color: checkedColor },
            tickColor
              ? { ['--checkmark-tick-color' as string]: tickColor }
              : null
          )}
        />
      </animated.div>
    );
  }
}
