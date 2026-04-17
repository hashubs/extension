import { SanitizedPortfolio } from '@/shared/fungible/sanitize-portfolio';
import { sortTokens } from '@/shared/fungible/tokens-sort';
import { cn } from '@/ui/lib/utils';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMemo, useState } from 'react';
import { IoChevronDown, IoEyeOff } from 'react-icons/io5';
import { FungibleItem } from './FungibleItem';
import { FungibleListSkeleton } from './FungibleSkeleton';

const ITEM_HEIGHT = 66;
const HIDDEN_HEADER_HEIGHT = 50;

interface FungibleListVirtualProps {
  data: SanitizedPortfolio[];
  hiddenData: SanitizedPortfolio[];
  isLoading?: boolean;
  hiddenBadge?: boolean;
  scrollElement: HTMLDivElement | null;
  onTokenClick?: (token: SanitizedPortfolio) => void;
}

type FlatItem =
  | { type: 'token'; data: SanitizedPortfolio }
  | { type: 'hidden-header'; count: number }
  | { type: 'hidden-token'; data: SanitizedPortfolio };

export function FungibleListVirtual({
  data,
  hiddenData,
  isLoading,
  hiddenBadge = false,
  scrollElement,
  onTokenClick,
}: FungibleListVirtualProps) {
  const [showHidden, setShowHidden] = useState(false);

  const flatItems = useMemo<FlatItem[]>(() => {
    const sorted = sortTokens(data, 'native-top');
    const sortedHidden = sortTokens(hiddenData, 'native-top');
    const items: FlatItem[] = sorted.map((d) => ({ type: 'token', data: d }));

    if (sortedHidden.length > 0) {
      items.push({ type: 'hidden-header', count: sortedHidden.length });
      if (showHidden) {
        sortedHidden.forEach((d) =>
          items.push({ type: 'hidden-token', data: d })
        );
      }
    }

    return items;
  }, [data, hiddenData, showHidden]);

  const virtualizer = useVirtualizer({
    count: flatItems.length,
    getScrollElement: () => scrollElement,
    estimateSize: (index) => {
      const item = flatItems[index];
      return item.type === 'hidden-header' ? HIDDEN_HEADER_HEIGHT : ITEM_HEIGHT;
    },
    overscan: 5,
    gap: 8,
  });

  if (isLoading) {
    return <FungibleListSkeleton count={3} />;
  }

  if (flatItems.length === 0) {
    return (
      <div className="text-center py-8 text-foreground/40 text-sm">
        No assets found
      </div>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      style={{
        height: `${virtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }}
    >
      {virtualItems.map((virtualRow) => {
        const item = flatItems[virtualRow.index];

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
            {item.type === 'hidden-header' ? (
              <button
                onClick={() => setShowHidden((v) => !v)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors'
                )}
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IoEyeOff className="w-4 h-4" />
                  <span>Hidden Tokens</span>
                  <span className="px-2 py-0.5 text-xs bg-muted rounded-full">
                    {item.count}
                  </span>
                </div>
                <IoChevronDown
                  className={cn(
                    'w-4 h-4 text-muted-foreground transition-transform duration-200',
                    showHidden ? 'rotate-180' : ''
                  )}
                />
              </button>
            ) : (
              <FungibleItem
                data={item.data}
                onClick={onTokenClick}
                hiddenBadge={hiddenBadge}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
