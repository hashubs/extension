import { useEffect } from 'react';
import { useStore } from '@store-unit/react';
import { preferenceStore } from './preference-store';

export function useAnimationPreference() {
  const { enableAnimation } = useStore(preferenceStore);

  const toggleAnimation = () => {
    preferenceStore.setState({
      ...preferenceStore.getState(),
      enableAnimation: !enableAnimation,
    });
  };

  const setAnimation = (val: boolean) => {
    preferenceStore.setState({
      ...preferenceStore.getState(),
      enableAnimation: val,
    });
  };

  return {
    enableAnimation,
    toggleAnimation,
    setAnimation,
  };
}

export function useApplyGlobalAnimationClass() {
  const { enableAnimation } = useAnimationPreference();

  useEffect(() => {
    if (!enableAnimation) {
      document.body.classList.add('disable-animations');
    } else {
      document.body.classList.remove('disable-animations');
    }
  }, [enableAnimation]);
}
