import { Header } from '@/ui/components/header';
import { preferenceStore, ThemePreference } from '@/ui/features/appearance';
import { Card, CardItem } from '@/ui/ui-kit/card';
import { useStore } from '@store-unit/react';
import { LuCheck as Check, LuMonitor, LuMoon, LuSun } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

export const themeOptions: {
  value: ThemePreference;
  icon: typeof LuSun;
  label: string;
}[] = [
  { value: ThemePreference.light, icon: LuSun, label: 'Light' },
  { value: ThemePreference.dark, icon: LuMoon, label: 'Dark' },
  { value: ThemePreference.system, icon: LuMonitor, label: 'System' },
];

export function ThemeView() {
  const navigate = useNavigate();
  const { mode } = useStore(preferenceStore);

  const setTheme = (theme: ThemePreference) => {
    preferenceStore.setState((current) => ({
      ...current,
      mode: theme,
    }));
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Theme"
        onBack={() => navigate('/settings', { state: { direction: 'back' } })}
      />

      <div className="flex-1 p-4 pt-0 space-y-4 no-scrollbar overflow-y-auto">
        <p className="text-sm text-muted-foreground mb-4">
          Select your preferred theme for the interface.
        </p>
        <Card>
          {themeOptions.map(({ value, icon: Icon, label }) => (
            <CardItem
              key={value}
              item={{
                icon: Icon,
                label,
                iconRight: mode === value ? Check : undefined,
                onClick: () => setTheme(value),
              }}
            />
          ))}
        </Card>
      </div>
    </div>
  );
}

export const ThemeBadge = () => {
  const { mode } = useStore(preferenceStore);
  const current = themeOptions.find((o) => o.value === mode);
  return (
    <span className="text-xs font-medium text-foreground/60">
      {current?.label}
    </span>
  );
};
