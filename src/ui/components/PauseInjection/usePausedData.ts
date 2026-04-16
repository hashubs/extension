import { getActiveTabOrigin } from '@/shared/request/internal/getActiveTabOrigin';
import { useQuery } from '@tanstack/react-query';
import { useGlobalPreferences } from 'src/ui/features/preferences/usePreferences';

export function usePausedData() {
  const { data: tabData } = useQuery({
    queryKey: ['activeTab/origin'],
    queryFn: getActiveTabOrigin,
  });
  const { globalPreferences, mutation } = useGlobalPreferences();
  const tabUrl = tabData?.url;
  const protocol = tabUrl?.protocol;
  const tabUrlHttp =
    protocol === 'https:' || protocol === 'http:' ? tabUrl : undefined;
  const isPausedForAll = Boolean(
    globalPreferences?.providerInjection['<all_urls>']
  );
  const isPaused =
    isPausedForAll ||
    (tabUrlHttp
      ? Boolean(globalPreferences?.providerInjection[tabUrlHttp.origin])
      : false);
  return {
    tabUrl: tabUrlHttp,
    isPaused,
    pattern: isPausedForAll ? '<all_urls>' : tabUrlHttp?.origin ?? null,
    isPausedForAll,
    globalPreferences,
    setGlobalPreferences: mutation.mutateAsync,
    tabData,
  };
}
