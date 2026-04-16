import type { AnyAddressAction } from '@/modules/ethereum/transactions/addressAction';
import { useVirtualizer } from '@tanstack/react-virtual';
import groupBy from 'lodash/groupBy';
import { useEffect, useMemo } from 'react';
import { LuLoader } from 'react-icons/lu';
import { ActionDaySelector } from '../ActionDaySelector';
import { ActionItem } from '../ActionItem';

function getSafeTimestampMs(timestamp: number | string): number {
  const num = Number(timestamp);
  // If the timestamp is less than 10 billion, it's very likely in seconds, not milliseconds.
  return num < 10000000000 ? num * 1000 : num;
}

function startOfDate(timestamp: number | string) {
  const date = new Date(getSafeTimestampMs(timestamp));
  date.setHours(0, 0, 0, 0);
  return date;
}

export function ActionsList({
  actions,
  hasMore,
  isLoading,
  onLoadMore,
  scrollElement,
  targetDate: rawTargetDate,
  onChangeDate,
  onSelectTx,
}: {
  actions: AnyAddressAction[];
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore?(): void;
  scrollElement: HTMLDivElement | null;
  targetDate: string | null;
  onChangeDate(date: Date | null): void;
  onSelectTx?: (tx: AnyAddressAction) => void;
}) {
  const groupedByDate = useMemo(() => {
    return groupBy(actions, (item) =>
      startOfDate(new Date(item.timestamp).getTime() || Date.now()).getTime()
    );
  }, [actions]);

  const targetDate = useMemo(() => {
    return rawTargetDate ? new Date(rawTargetDate) : null;
  }, [rawTargetDate]);

  const emptyTargetDay = useMemo(() => {
    if (!targetDate) return false;
    const firstGroupTimestamp = Object.entries(groupedByDate)[0]?.[0];
    if (!firstGroupTimestamp) return false;

    const target = startOfDate(targetDate.getTime());
    const firstDay = startOfDate(Number(firstGroupTimestamp));

    return target > firstDay;
  }, [groupedByDate, targetDate]);

  const flattenedItems = useMemo(() => {
    const flat: Array<
      | { type: 'header'; timestamp: string; groupIndex: number }
      | { type: 'action'; data: AnyAddressAction }
    > = [];
    Object.entries(groupedByDate).forEach(([timestamp, items], index) => {
      flat.push({ type: 'header', timestamp, groupIndex: index });
      items.forEach((action) => flat.push({ type: 'action', data: action }));
    });
    return flat;
  }, [groupedByDate]);

  const virtualizer = useVirtualizer({
    count: flattenedItems.length,
    getScrollElement: () => scrollElement,
    estimateSize: (index) => {
      const item = flattenedItems[index];
      return item.type === 'header' ? 50 : 68;
    },
    overscan: 10,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const lastItem = virtualItems[virtualItems.length - 1];

  useEffect(() => {
    if (!lastItem) return;
    if (
      lastItem.index >= flattenedItems.length - 1 &&
      hasMore &&
      !isLoading &&
      onLoadMore
    ) {
      onLoadMore();
    }
  }, [lastItem?.index, flattenedItems.length, hasMore, isLoading, onLoadMore]);

  const TODAY = new Date();
  const FIRST_DATE = new Date('2018-01-01');

  return (
    <div className="flex flex-col gap-6" style={{ alignContent: 'start' }}>
      <div className="flex flex-col gap-6 w-full">
        {emptyTargetDay && targetDate && !isLoading && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex pl-2">
                <ActionDaySelector
                  trigger={
                    <span className="text-[13px] font-bold text-foreground">
                      {new Intl.DateTimeFormat('en', {
                        dateStyle: 'medium',
                      }).format(targetDate)}
                    </span>
                  }
                  selectedDate={targetDate}
                  maxDate={TODAY}
                  minDate={FIRST_DATE}
                  onDateSelect={onChangeDate}
                />
              </div>
              <button
                type="button"
                onClick={() => onChangeDate(null)}
                className="text-[13px] font-semibold text-blue-500 hover:text-blue-400 truncate"
              >
                Show Latest Actions
              </button>
            </div>
            <div className="px-4 py-3 mx-4 rounded-lg bg-muted/10 text-[13px] text-muted-foreground">
              No transactions found for this day.
            </div>
          </div>
        )}

        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualRow) => {
            const item = flattenedItems[virtualRow.index];

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {item.type === 'header' ? (
                  <div className="flex items-center gap-3 px-4 pb-2 pt-4 bg-background z-10 w-full mb-1">
                    <div className="flex">
                      <ActionDaySelector
                        trigger={
                          <span className="text-[14px] font-bold text-foreground hover:opacity-80 transition-opacity">
                            {new Intl.DateTimeFormat('en', {
                              dateStyle: 'medium',
                            }).format(Number(item.timestamp))}
                          </span>
                        }
                        selectedDate={targetDate || undefined}
                        maxDate={TODAY}
                        minDate={FIRST_DATE}
                        onDateSelect={onChangeDate}
                      />
                    </div>
                    {!emptyTargetDay &&
                      targetDate &&
                      item.groupIndex === 0 &&
                      !isLoading && (
                        <button
                          type="button"
                          onClick={() => onChangeDate(null)}
                          className="text-[14px] font-medium text-[#40a9ff] hover:text-[#52c41a] transition-colors"
                        >
                          Show Latest Actions
                        </button>
                      )}
                  </div>
                ) : (
                  <div className="px-0 relative w-full h-full pb-[2px]">
                    <ActionItem
                      addressAction={item.data as any}
                      onClick={
                        onSelectTx ? () => onSelectTx(item.data) : undefined
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {(isLoading || hasMore) && actions.length > 0 && (
        <div className="flex justify-center py-4 pb-8 h-14 items-center w-full">
          {isLoading ? (
            <LuLoader className="w-5 h-5 text-blue-500 animate-spin" />
          ) : (
            <span className="text-[13px] text-muted-foreground animate-pulse">
              Loading more actions...
            </span>
          )}
        </div>
      )}
    </div>
  );
}
