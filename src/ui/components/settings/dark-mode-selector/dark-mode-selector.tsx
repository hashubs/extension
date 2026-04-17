import { preferenceStore, ThemePreference } from '@/ui/features/appearance';
import { useStore } from '@store-unit/react';
import { DarkModeSelectorComponent } from './dark-mode-selector.component';

type DarkModeSelectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DarkModeSelector({
  open,
  onOpenChange,
}: DarkModeSelectorProps) {
  const { mode } = useStore(preferenceStore);

  const setTheme = (theme: ThemePreference) => {
    preferenceStore.setState((current) => ({
      ...current,
      mode: theme,
    }));
  };

  return (
    <DarkModeSelectorComponent
      open={open}
      theme={mode}
      onOpenChange={onOpenChange}
      onSetTheme={setTheme}
    />
  );
}
