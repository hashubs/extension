import { INTERNAL_ORIGIN } from '@/background/constants';
import { Chain } from '@/modules/networks/chain';
import { ConnectedSiteDrawer } from '@/ui/components/ConnectedSite';
import {
  CONNECTION_HEADER_HEIGHT,
  useConnectionHeaderDrag,
} from '@/ui/hooks/useConnectionHeaderDrag';
import { cn } from '@/ui/lib/utils';
import { Button } from '@/ui/ui-kit';
import { animated } from '@react-spring/web';
import { useState } from 'react';
import {
  PausedHeader,
  PauseInjectionDrawer,
} from 'src/ui/components/PauseInjection';
import { Tabs } from 'webextension-polyfill';
import { useConnectionSite } from '../connection-site';

type TabData =
  | {
      url: URL;
      tabOrigin: string;
      tab: Tabs.Tab;
    }
  | null
  | undefined;

interface ConnectionHeaderProps {
  tabData: TabData;
  isRevealable: boolean;
  isConnectableSite: boolean;
  isConnectedToActiveTab: boolean;
  siteChain: Chain | null | undefined;
  showPausedHeader: boolean;
  isHidden: boolean;
}

function ConnectionSite({
  tabData,
  isRevealable,
  isConnectableSite,
  isConnectedToActiveTab,
  siteChain,
  showPausedHeader,
  isHidden,
}: ConnectionHeaderProps) {
  if (isHidden || !isRevealable) return null;

  return (
    <div className="bg-background p-4 pb-0!">
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
  );
}

type DragHandlers = ReturnType<typeof useConnectionHeaderDrag>['dragHandlers'];

interface Props {
  children: (
    dragHandlers: DragHandlers,
    scrollElement: HTMLDivElement | null
  ) => React.ReactNode;
}

export function ConnectionSiteDragable({ children }: Props) {
  const {
    isRevealable,
    isDataLoading,
    tabData,
    isConnectableSite,
    isConnectedToActiveTab,
    siteChain,
    showPausedHeader,
  } = useConnectionSite();

  const { y, dragHandlers } = useConnectionHeaderDrag({
    enabled: isRevealable,
  });

  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null
  );

  return (
    <div ref={setScrollElement} className="relative overflow-auto h-full">
      <div
        className="relative z-0"
        style={{ height: CONNECTION_HEADER_HEIGHT }}
      >
        <ConnectionSite
          tabData={tabData}
          siteChain={siteChain}
          isRevealable={isRevealable}
          isConnectableSite={isConnectableSite}
          isConnectedToActiveTab={isConnectedToActiveTab}
          showPausedHeader={showPausedHeader}
          isHidden={!isRevealable || isDataLoading}
        />
      </div>

      <animated.div
        className="relative z-10"
        style={{
          y,
          touchAction: isRevealable ? 'none' : 'auto',
        }}
      >
        {children(dragHandlers, scrollElement)}
      </animated.div>
    </div>
  );
}
