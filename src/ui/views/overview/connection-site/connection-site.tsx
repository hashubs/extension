import { INTERNAL_ORIGIN } from '@/background/constants';
import { isSolanaAddress } from '@/modules/solana/shared';
import { walletPort } from '@/shared/channel';
import { isEthereumAddress } from '@/shared/is-ethereum-address';
import { isConnectableDapp } from '@/shared/isConnectableDapp';
import { requestChainForOrigin } from '@/shared/request/internal/requestChainForOrigin';
import { getAddressType } from '@/shared/wallet/classifiers';
import { useAnimationPreference } from '@/ui/features/appearance';
import { useIsConnectedToActiveTab } from '@/ui/hooks/request/internal/useIsConnectedToActiveTab';
import { useNetworkConfig } from '@/ui/hooks/request/internal/useNetworks';
import { useAddressParams } from '@/ui/hooks/request/internal/useWallet';
import { cn } from '@/ui/lib/utils';
import { Button, Image } from '@/ui/ui-kit';
import { animated, useSpring } from '@react-spring/web';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { IoChevronDown } from 'react-icons/io5';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  PausedHeader,
  PauseInjectionDrawer,
  usePausedData,
} from 'src/ui/components/PauseInjection';
import { ConnectedSiteDrawer } from './connected-site-drawer';

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

  const { data: siteChain, ...chainQuery } = useQuery({
    queryKey: ['requestChainForOrigin', activeTabOrigin, address],
    queryFn: async () => {
      if (activeTabOrigin) {
        return requestChainForOrigin(activeTabOrigin, getAddressType(address));
      }
      return null;
    },
    enabled: !!activeTabOrigin,
  });

  const switchChainMutation = useMutation({
    mutationFn: ({ chain, origin }: { chain: string; origin: string }) => {
      if (isSolanaAddress(address)) {
        return walletPort.request('switchChainForOrigin', {
          solanaChain: chain,
          origin,
        });
      } else if (isEthereumAddress(address)) {
        return walletPort.request('switchChainForOrigin', {
          evmChain: chain,
          origin,
        });
      } else {
        throw new Error('Cannot determine current address type');
      }
    },
    onSuccess: () => {
      chainQuery.refetch();
    },
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const dappChain = searchParams.get('dappChain');

  useEffect(() => {
    if (dappChain && activeTabOrigin) {
      switchChainMutation.mutate(
        { chain: dappChain, origin: activeTabOrigin },
        {
          onSuccess: () => {
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('dappChain');
            setSearchParams(newParams, { replace: true });
          },
        }
      );
    }
  }, [dappChain, activeTabOrigin]);

  const isChainPending = !!(isConnectedToActiveTab && siteChain === undefined);
  const isDataLoading = !!(
    isConnectableSite &&
    (isConnectionPending || isChainPending)
  );

  const isRevealable =
    tabData === undefined || !!(isConnectableSite || showPausedHeader);

  const { data: networkConfig } = useNetworkConfig(
    siteChain?.toString() || null
  );

  return {
    tabData,
    isRevealable,
    isDataLoading,
    isPaused,
    globalPreferences,
    isConnectableSite,
    isConnectedToActiveTab,
    siteChain,
    networkConfig,
    isChainPending,
    isConnected,
    isConnectionPending,
    showPausedHeader,
  };
}

export function ConnectionSite({ isHidden }: { isHidden: boolean }) {
  const { enableAnimation } = useAnimationPreference();

  const {
    tabData,
    isRevealable,
    isConnectableSite,
    isConnectedToActiveTab,
    siteChain,
    networkConfig,
    showPausedHeader,
  } = useConnectionSite();

  const navigate = useNavigate();

  const handleNetworkSelect = useCallback(() => {
    const nextParams = new URLSearchParams();
    nextParams.set('next', '/overview');
    nextParams.set('paramName', 'dappChain');
    nextParams.set('showAll', 'false');

    if (siteChain) {
      nextParams.set('dappChain', siteChain.toString());
    }

    navigate(`/select-network?${nextParams.toString()}`);
  }, [navigate, siteChain]);

  const springs = useSpring({
    to: {
      height: isHidden ? 0 : 55,
      opacity: isHidden ? 0 : 1,
      transform: isHidden ? 'translateY(-10px)' : 'translateY(0px)',
    },
    config: { tension: 300, friction: 26 },
    immediate: !enableAnimation,
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
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-auto h-7 px-2.5 rounded-full"
                      icon={IoChevronDown}
                      iconPosition="right"
                      iconClassName="opacity-40"
                      onClick={handleNetworkSelect}
                    >
                      <div className="flex items-center gap-1.5 mr-0.5">
                        {networkConfig?.icon_url && (
                          <Image
                            src={networkConfig.icon_url}
                            alt={networkConfig.name || 'network'}
                            className="size-3.5"
                          />
                        )}
                        <span className="text-[11px] font-bold truncate max-w-[80px]">
                          {networkConfig?.name || siteChain.toString()}
                        </span>
                      </div>
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
