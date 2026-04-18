import { INTERNAL_ORIGIN } from '@/background/constants';
import { toCustomNetworkId } from '@/modules/ethereum/chains/helpers';
import { Networks as NetworksModule } from '@/modules/networks/networks';
import { getChainLogo } from '@/shared/chains/chain-logos';
import { walletPort } from '@/shared/channel';
import { normalizeChainId } from '@/shared/normalize-chain-id';
import {
  type EVMChainDataResponse,
  isTestnet as checkIsTestnet,
} from '@/shared/request/external/defillama-get-chains';
import { useExternalChains } from '@/ui/hooks/request/external/use-external-chains';
import { Image } from '@/ui/ui-kit';
import { Button } from '@/ui/ui-kit/button';
import { Card, CardItem } from '@/ui/ui-kit/card';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
} from '@/ui/ui-kit/drawer';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useCallback, useEffect, useRef, useState } from 'react';
import { IoIosCheckmark } from 'react-icons/io';
import { IoAddOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { updateNetworks } from '../_shared/updateNetworks';

export function SearchResults({
  networks,
  query: externalQuery,
  testnetMode,
}: {
  networks: NetworksModule | null;
  query: string;
  testnetMode: boolean;
}) {
  const navigate = useNavigate();
  const parentRef = useRef<HTMLDivElement>(null);
  const [reviewChain, setReviewChain] = useState<EVMChainDataResponse | null>(
    null
  );
  const [isAdding, setIsAdding] = useState(false);

  const { setQuery, displayed, isLoading, hasMore, loadMore } =
    useExternalChains(networks, testnetMode);

  useEffect(() => {
    setQuery(externalQuery);
  }, [externalQuery, setQuery]);

  const handleQuickAdd = useCallback(
    async (registryChain: EVMChainDataResponse) => {
      setIsAdding(true);
      try {
        const id = toCustomNetworkId(registryChain.chainId.toString());
        await walletPort.request('addEthereumChain', {
          values: [
            {
              chainName: registryChain.name,
              rpcUrls: registryChain.rpc || [],
              chainId: normalizeChainId(registryChain.chainId),
              nativeCurrency: registryChain.nativeCurrency,
              blockExplorerUrls:
                registryChain.explorers?.map((e: any) => e.url) || [],
              is_testnet: checkIsTestnet(registryChain),
            },
          ],
          origin: INTERNAL_ORIGIN,
          chain: id,
          prevChain: null,
        });
        await updateNetworks();
        navigate(`/settings/networks`);
      } finally {
        setIsAdding(false);
        setReviewChain(null);
      }
    },
    [navigate]
  );

  const rowVirtualizer = useVirtualizer({
    count: displayed.length + (hasMore ? 1 : 0),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 68,
    overscan: 5,
  });

  const handleNavigate = useCallback(
    (id: string) => navigate(`/settings/networks/${id}`),
    [navigate]
  );

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      <div
        ref={parentRef}
        className="flex-1 overflow-y-auto no-scrollbar pb-6"
        style={{ height: '100%', minHeight: 0 }}
      >
        {isLoading && displayed.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <span className="size-5 border-2 border-foreground/20 border-t-foreground/70 rounded-full animate-spin" />
          </div>
        ) : displayed.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No networks found.
          </p>
        ) : (
          <div
            className="relative w-full"
            style={{ height: rowVirtualizer.getTotalSize() }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const isLoaderRow = virtualRow.index >= displayed.length;

              if (isLoaderRow) {
                return (
                  <div
                    key={virtualRow.key}
                    ref={(el) => {
                      if (el) {
                        const observer = new IntersectionObserver(
                          ([entry]) => {
                            if (entry.isIntersecting) {
                              loadMore();
                              observer.disconnect();
                            }
                          },
                          { threshold: 0.1 }
                        );
                        observer.observe(el);
                      }
                    }}
                    className="absolute left-0 w-full flex items-center justify-center"
                    style={{
                      height: virtualRow.size,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <span className="size-4 border-2 border-foreground/20 border-t-foreground/70 rounded-full animate-spin" />
                  </div>
                );
              }

              const item = displayed[virtualRow.index];
              const caip = item.data
                ? `eip155:${item.data.chainId}`
                : undefined;

              return (
                <div
                  key={item.key}
                  className="absolute left-0 w-full px-0.5 py-1"
                  style={{
                    height: virtualRow.size,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <Card className="border border-border">
                    <CardItem
                      item={{
                        label: item.label,
                        subLabel: item.subLabel,
                        imgUrl:
                          item.imgUrl ||
                          (caip ? getChainLogo(caip) : undefined),
                        iconRight: item.isSaved ? IoIosCheckmark : IoAddOutline,
                        iconRightClassName:
                          'border border-muted-foreground/20 rounded-full size-[20px]',
                        ...(item.isSaved
                          ? { onClick: () => handleNavigate(item.key) }
                          : {
                              onClick: () => {
                                console.log(
                                  '[SearchResults] item.data',
                                  item.data
                                );
                                if (item.data) setReviewChain(item.data);
                              },
                              onClickIconRight: () => {
                                if (item.data) setReviewChain(item.data);
                              },
                            }),
                        className: 'border-border',
                      }}
                    />
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Drawer
        open={!!reviewChain}
        onOpenChange={(open) => !open && setReviewChain(null)}
      >
        <DrawerContent
          variant="inset"
          title="Add Network"
          description="Add Network"
        >
          {reviewChain && (
            <div className="flex flex-col gap-6 px-4 pb-6 pt-2">
              <div className="flex items-center gap-2">
                <Image
                  src={getChainLogo(`eip155:${reviewChain.chainId}`)}
                  alt={reviewChain.name}
                  className="size-10 rounded-full object-contain"
                />
                <div>
                  <h3 className="text-sm font-semibold">{reviewChain.name}</h3>
                  {reviewChain.infoURL ? (
                    <p className="text-xs text-muted-foreground">
                      {reviewChain.infoURL}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-border bg-muted/10">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Network URL
                  </span>
                  <span className="text-xs break-all font-medium">
                    {reviewChain.rpc?.[0] || '-'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-border bg-muted/10">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Chain ID
                    </span>
                    <span className="text-xs font-medium">
                      {reviewChain.chainId}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-border bg-muted/10">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Currency Symbol
                    </span>
                    <span className="text-xs font-medium">
                      {reviewChain.nativeCurrency.symbol}
                    </span>
                  </div>
                </div>

                {reviewChain.explorers?.[0] && (
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-border bg-muted/10">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Block Explorer
                    </span>
                    <span className="text-xs break-all font-medium">
                      {reviewChain.explorers[0].url}
                    </span>
                  </div>
                )}
              </div>

              <DrawerFooter className="p-0 mt-2 gap-3">
                <Button
                  className="w-full"
                  variant="primary"
                  onClick={() => handleQuickAdd(reviewChain)}
                  disabled={isAdding}
                >
                  {isAdding ? 'Adding...' : 'Add Network'}
                </Button>
                <DrawerClose asChild>
                  <Button className="w-full" variant="ghost">
                    Cancel
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
