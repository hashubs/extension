import { useAnimationPreference } from '@/ui/features/appearance';
import { animated, useSpring } from '@react-spring/web';
import { useEffect, useRef, useState } from 'react';

/**
 * Hook to handle header element visibility based on scrolling past a target.
 * Useful for sticky headers that should reveal "hidden" info when main info is scrolled away.
 */
export function useHeaderPriceReveal() {
  const { enableAnimation } = useAnimationPreference();

  const [show, setShow] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const styles = useSpring({
    opacity: show ? 1 : 0,
    maxWidth: show ? 150 : 0,
    config: {
      duration: 200,
      precision: 0.001,
    },
    immediate: !enableAnimation,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShow(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      {
        threshold: 0,
        rootMargin: '-5px 0px 0px 0px',
      }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return { triggerRef, styles, animated, show };
}
