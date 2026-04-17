import { INTERNAL_ORIGIN } from '@/background/constants';
import { isConnectableDapp } from '@/shared/isConnectableDapp';
import { requestChainForOrigin } from '@/shared/request/internal/requestChainForOrigin';
import { getAddressType } from '@/shared/wallet/classifiers';
import { ConnectedSiteDrawer } from '@/ui/components/ConnectedSite';
import { useAddressParams } from '@/ui/hooks/request/internal/useAddressParams';
import { useIsConnectedToActiveTab } from '@/ui/hooks/request/internal/useIsConnectedToActiveTab';
import { cn } from '@/ui/lib/utils';
import { Button } from '@/ui/ui-kit';
import { animated, useSpring } from '@react-spring/web';
import { useQuery } from '@tanstack/react-query';
import {
  PausedHeader,
  PauseInjectionDrawer,
  usePausedData,
} from 'src/ui/components/PauseInjection';

export function useConnectionSite() {
  const { isPaused, globalPreferences, tabData } = usePausedData();
  const showPausedHeader = !!(isPaused && globalPreferences);
  const isConnectableSite = tabData?.url
    ? isConnectableDapp(tabData.url)
    : false;

  const { singleAddressNormalized: address } = useAddressParams();
  const { data: isConnected, isPending: isConnectionPending } =
    useIsConnectedToActiveTab(address);

  const activeTabOrigin = tabData?.tabOrigin;
  const isConnectedToActiveTab = !!(isConnected && activeTabOrigin);

  const { data: siteChain } = useQuery({
    queryKey: ['requestChainForOrigin', activeTabOrigin, address],
    queryFn: async () => {
      if (activeTabOrigin) {
        return requestChainForOrigin(activeTabOrigin, getAddressType(address));
      }
      return null;
    },
    enabled: !!activeTabOrigin,
  });

  const isChainPending = !!(isConnectedToActiveTab && siteChain === undefined);
  const isDataLoading = !!(
    isConnectableSite &&
    (isConnectionPending || isChainPending)
  );

  const isRevealable =
    tabData === undefined || !!(isConnectableSite || showPausedHeader);

  return {
    tabData,
    isRevealable,
    isDataLoading,
    isPaused,
    globalPreferences,
    isConnectableSite,
    isConnectedToActiveTab,
    siteChain,
    isChainPending,
    isConnected,
    isConnectionPending,
    showPausedHeader,
  };
}

export function ConnectionSite({ isHidden }: { isHidden: boolean }) {
  const {
    tabData,
    isRevealable,
    isConnectableSite,
    isConnectedToActiveTab,
    siteChain,
    showPausedHeader,
  } = useConnectionSite();

  const springs = useSpring({
    to: {
      height: isHidden ? 0 : 55,
      opacity: isHidden ? 0 : 1,
      transform: isHidden ? 'translateY(-10px)' : 'translateY(0px)',
    },
    config: { tension: 300, friction: 26 },
  });

  if (!isRevealable) return null;

  return (
    <animated.div
      style={{
        ...springs,
        overflow: 'hidden',
      }}
      className="bg-background shrink-0"
    >
      <div className="p-4">
        <div className="flex flex-row gap-2 items-center justify-between">
          {showPausedHeader ? (
            <PausedHeader />
          ) : (
            <div className="flex flex-row gap-3 items-center flex-1 overflow-hidden">
              {isConnectableSite && tabData?.tabOrigin && (
                <ConnectedSiteDrawer originName={tabData.tabOrigin} />
              )}

              {isConnectedToActiveTab ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <div className="text-[14px] font-bold leading-tight truncate text-foreground/90 lowercase tracking-tight">
                      {tabData?.url.hostname}
                    </div>
                    <div className="text-[12px] font-medium leading-tight lowercase text-teal-500">
                      Connected
                    </div>
                  </div>
                  {siteChain && (
                    <Button size="sm" variant="outline" className="w-auto">
                      Network
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <div className="text-[14px] font-bold leading-tight truncate text-foreground/90 lowercase tracking-tight">
                    {tabData?.tabOrigin === INTERNAL_ORIGIN
                      ? 'Selvo Extension'
                      : tabData?.tabOrigin || 'Unknown Site'}
                  </div>
                  <div
                    className={cn(
                      'text-[12px] font-medium leading-tight lowercase',
                      isConnectableSite
                        ? 'text-muted-foreground/50'
                        : 'text-neutral-500'
                    )}
                  >
                    {isConnectableSite ? 'Not Connected' : 'Not a Website'}
                  </div>
                </div>
              )}
            </div>
          )}
          <PauseInjectionDrawer />
        </div>
      </div>
    </animated.div>
  );
}
