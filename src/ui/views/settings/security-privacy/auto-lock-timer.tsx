import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { GlobalPreferences } from '@/shared/types/global-preferences';
import { Header } from '@/ui/components/header';
import { useGlobalPreferences } from '@/ui/features/preferences/usePreferences';
import { Card, CardItem } from '@/ui/ui-kit';
import { isTruthy } from 'is-truthy-ts';
import { LuCheck } from 'react-icons/lu';

const isDev = process.env.NODE_ENV === 'development';

type TimerOptions = Array<{
  title: string;
  value: GlobalPreferences['autoLockTimeout'];
}>;

const TWELVE_HOURS = 1000 * 60 * 60 * 12;

const AUTO_LOCK_TIMER_OPTIONS = [
  { title: '1 Minute', value: 1000 * 60 },
  isDev ? { title: '2 Minutes', value: 1000 * 60 * 2 } : null,
  isDev ? { title: '3 Minutes', value: 1000 * 60 * 3 } : null,
  isDev ? { title: '5 Minutes', value: 1000 * 60 * 5 } : null,
  { title: '10 Minutes', value: 1000 * 60 * 10 },
  { title: '1 Hour', value: 1000 * 60 * 60 },
  { title: '12 Hours', value: TWELVE_HOURS },
  { title: '24 Hours', value: 1000 * 60 * 60 * 24 },
  { title: 'None', value: 'none' } as const,
].filter(isTruthy) satisfies TimerOptions;

export const AUTO_LOCK_TIMER_OPTIONS_TITLES = Object.fromEntries(
  Object.values(AUTO_LOCK_TIMER_OPTIONS).map(({ title, value }) => [
    value,
    title,
  ])
);

const BACK_ROUTE = '/settings/security-privacy';

export function AutoLockTimerView() {
  const navigate = useNavigate();
  const { globalPreferences, setGlobalPreferences, mutation } =
    useGlobalPreferences();

  useEffect(() => {
    if (mutation.isSuccess) {
      navigate(BACK_ROUTE, { state: { direction: 'back' } });
    }
  }, [mutation.isSuccess, navigate]);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Auto-Lock Timer"
        onBack={() => navigate(BACK_ROUTE, { state: { direction: 'back' } })}
      />
      <div className="flex-1 p-4 pt-0 space-y-4 no-scrollbar overflow-y-auto">
        <Card title="Choose timer">
          {AUTO_LOCK_TIMER_OPTIONS.map((option) => (
            <CardItem
              key={option.value}
              item={{
                label: option.title,
                onClick: () =>
                  setGlobalPreferences({ autoLockTimeout: option.value }),
                iconRight:
                  globalPreferences?.autoLockTimeout === option.value
                    ? LuCheck
                    : undefined,
              }}
            />
          ))}
        </Card>
      </div>
    </div>
  );
}

export const AutoLockTimerBadge = () => {
  const { globalPreferences } = useGlobalPreferences();
  return (
    <span className="text-xs font-medium text-foreground/60 capitalize">
      {globalPreferences
        ? AUTO_LOCK_TIMER_OPTIONS_TITLES[globalPreferences.autoLockTimeout]
        : '...'}
    </span>
  );
};
