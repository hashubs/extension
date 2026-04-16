import { INTERNAL_ORIGIN } from '@/background/constants';
import { isConnectableDapp } from '@/shared/isConnectableDapp';
import { requestChainForOrigin } from '@/shared/request/internal/requestChainForOrigin';
import { getAddressType } from '@/shared/wallet/classifiers';
import { ConnectedSiteDrawer } from '@/ui/components/ConnectedSite';
import { useAddressParams } from '@/ui/hooks/request/internal/useAddressParams';
import { useIsConnectedToActiveTab } from '@/ui/hooks/request/internal/useIsConnectedToActiveTab';
import {
  CONNECTION_HEADER_HEIGHT,
  useConnectionHeaderDrag,
} from '@/ui/hooks/useConnectionHeaderDrag';
import { cn } from '@/ui/lib/utils';
import { Button } from '@/ui/ui-kit';
import { animated } from '@react-spring/web';
import { useQuery } from '@tanstack/react-query';
import {
  PausedHeader,
  PauseInjectionDrawer,
  usePausedData,
} from 'src/ui/components/PauseInjection';

function ConnectionHeader({ isHidden }: { isHidden: boolean }) {
  const { isPaused, globalPreferences, tabData } = usePausedData();
  const showPausedHeader = !!(isPaused && globalPreferences);

  const activeTabOrigin = tabData?.tabOrigin;
  const activeTabHostname = tabData?.url.hostname;

  const { singleAddressNormalized: address } = useAddressParams();
  const isConnectableSite = tabData?.url
    ? isConnectableDapp(tabData.url)
    : false;

  const { data: siteChain } = useQuery({
    queryKey: ['requestChainForOrigin', activeTabOrigin, address],
    queryFn: async () => {
      if (activeTabOrigin) {
        return requestChainForOrigin(activeTabOrigin, getAddressType(address));
      }
      return null;
    },
    enabled: Boolean(activeTabOrigin),
  });

  const { data: isConnected } = useIsConnectedToActiveTab(address);

  const isConnectedToActiveTab = !!(isConnected && activeTabOrigin);

  if (isHidden) return null;

  return (
    <div className="bg-background p-4 pb-0!">
      <div className="flex flex-row gap-2 items-center justify-between">
        {showPausedHeader ? (
          <PausedHeader />
        ) : (
          <div className="flex flex-row gap-3 items-center flex-1 overflow-hidden">
            {isConnectableSite && activeTabOrigin && (
              <ConnectedSiteDrawer originName={activeTabOrigin} />
            )}

            {isConnectedToActiveTab ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <div className="text-[14px] font-bold leading-tight truncate text-foreground/90 lowercase tracking-tight">
                    {activeTabHostname}
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
                  {activeTabOrigin === INTERNAL_ORIGIN
                    ? 'Selvo Extension'
                    : activeTabHostname || 'Unknown Site'}
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
  );
}

type DragHandlers = ReturnType<typeof useConnectionHeaderDrag>['dragHandlers'];

interface Props {
  children: (dragHandlers: DragHandlers) => React.ReactNode;
}

export function ConnectionHeaderReveal({ children }: Props) {
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

  const { y, dragHandlers } = useConnectionHeaderDrag({
    enabled: isRevealable,
  });

  return (
    <div className="relative overflow-auto h-full">
      <div
        className="relative z-0"
        style={{ height: CONNECTION_HEADER_HEIGHT }}
      >
        <ConnectionHeader isHidden={!isRevealable || isDataLoading} />
      </div>

      <animated.div
        className="relative z-10"
        style={{
          y,
          touchAction: isRevealable ? 'none' : 'auto',
        }}
      >
        {children(dragHandlers)}
      </animated.div>
    </div>
  );
}
