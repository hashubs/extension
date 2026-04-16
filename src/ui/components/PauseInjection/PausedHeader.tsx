import { Button } from '@/ui/ui-kit';
import { reloadActiveTab } from 'src/shared/reloadActiveTab';
import { disableInjectionPreference } from './actions';
import { usePausedData } from './usePausedData';

export function PausedHeader() {
  const {
    isPaused,
    isPausedForAll,
    pattern,
    tabUrl,
    globalPreferences,
    setGlobalPreferences,
  } = usePausedData();

  if (!isPaused || !globalPreferences) {
    return null;
  }

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-1">
        <span className="text-sm text-yellow-500">Paused for</span>
        {isPausedForAll ? (
          <span className="text-sm font-semibold text-yellow-600">
            All DApps
          </span>
        ) : (
          <span className="text-sm font-semibold truncate">
            {tabUrl?.hostname || 'current tab'}
          </span>
        )}
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          setGlobalPreferences(
            disableInjectionPreference(globalPreferences, pattern)
          ).then(reloadActiveTab)
        }
        className="w-auto"
      >
        Resume
      </Button>
    </div>
  );
}
