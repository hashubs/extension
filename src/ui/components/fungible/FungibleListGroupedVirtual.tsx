import { getChainLogo } from '@/shared/chains/chain-logos';
import { groupTokensBySymbol } from '@/shared/fungible/tokens-group';
import { SanitizedPortfolio } from '@/shared/fungible/sanitize-portfolio';
import { sortTokens } from '@/shared/fungible/tokens-sort';
import { formatFiat } from '@/shared/units/format-fiat';
import { formatTokenAmount } from '@/shared/units/format-token';
import { useFiatConversion } from '@/ui/hooks/useFiatConversion';
import { cn } from '@/ui/lib/utils';
import { Image } from '@/ui/ui-kit';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useCallback, useMemo, useState } from 'react';
import { IoChevronDown, IoEyeOff } from 'react-icons/io5';
import { FungibleItem } from './FungibleItem';
import { FungibleListSkeleton } from './FungibleSkeleton';

const ITEM_HEIGHT = 66;
const GROUP_CHILD_HEIGHT = 60;
const HIDDEN_HEADER_HEIGHT = 50;

type FlatItem =
  | { type: 'token'; data: SanitizedPortfolio }
  | {
      type: 'group-header';
      symbol: string;
      items: SanitizedPortfolio[];
      isOpen: boolean;
    }
  | { type: 'group-child'; data: SanitizedPortfolio; isLast: boolean }
  | { type: 'hidden-header'; count: number }
  | { type: 'hidden-token'; data: SanitizedPortfolio };

interface FungibleListGroupedV2Props {
  data: SanitizedPortfolio[];
  hiddenData: SanitizedPortfolio[];
  isLoading?: boolean;
  hiddenBadge?: boolean;
  scrollElement: HTMLDivElement | null;
  onTokenClick?: (token: SanitizedPortfolio) => void;
}

function GroupHeader({
  items,
  isOpen,
  onToggle,
}: {
  items: SanitizedPortfolio[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { convertUsdToFiat, defaultCurrency } = useFiatConversion();
  const first = items[0];
  const totalValueUsd = items.reduce((sum, h) => sum + h.valueUsd, 0);
  const totalAmount = items.reduce((sum, h) => sum + Number(h.amount), 0);
  const previewChains = items.slice(0, 4);

  return (
    <div
      role="button"
      onClick={onToggle}
      className="flex items-center justify-between p-2.5 rounded-[17px] cursor-pointer bg-item w-full text-left border border-border/20 hover:bg-black/5! dark:hover:bg-white/5!"
    >
      <div className="flex items-center gap-3">
        <div className="relative size-[42px] rounded-full flex items-center justify-center text-[18px] font-bold shrink-0 bg-muted/80 border border-border/20">
          <Image
            src={first.logoUrl}
            alt={first.symbol}
            className="size-7 rounded-full border border-muted/20"
          />
          <div className="flex justify-center items-center size-[18px] absolute -bottom-0.5 -right-0.5 rounded-full bg-[#1e2024] border border-foreground/10">
            <IoChevronDown
              className="size-3 text-white"
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          </div>
        </div>

        <div>
          <p className="text-sm">{first.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {previewChains.map((h) => (
              <div
                key={h.assetId}
                className="size-[14px] rounded-full overflow-hidden bg-foreground/10 border border-foreground/10 flex items-center justify-center"
              >
                <Image
                  src={getChainLogo(h.assetId)}
                  alt={`chain-${h.assetId}`}
                  className="size-full object-contain"
                />
              </div>
            ))}
            {items.length > 4 && (
              <span className="text-[10px] text-foreground/40 ml-0.5">
                +{items.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="text-right">
        <p className="text-foreground text-sm">
          {formatFiat(convertUsdToFiat(totalValueUsd), defaultCurrency)}
        </p>
        <p className="text-muted-foreground text-[12px] m-0">
          {formatTokenAmount(totalAmount, first.symbol)}
        </p>
      </div>
    </div>
  );
}

export function FungibleListGroupedVirtual({
  data,
  hiddenData,
  isLoading,
  hiddenBadge = false,
  scrollElement,
  onTokenClick,
}: FungibleListGroupedV2Props) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);

  const toggleGroup = useCallback((symbol: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) {
        next.delete(symbol);
      } else {
        next.add(symbol);
      }
      return next;
    });
  }, []);

  const flatItems = useMemo<FlatItem[]>(() => {
    const sorted = sortTokens(data, 'native-top');
    const groupMap = groupTokensBySymbol(sorted);
    const items: FlatItem[] = [];

    for (const [symbol, groupItems] of groupMap.entries()) {
      if (groupItems.length === 1) {
        // Single item — render directly, no group header needed
        items.push({ type: 'token', data: groupItems[0] });
      } else {
        const isOpen = openGroups.has(symbol);
        items.push({ type: 'group-header', symbol, items: groupItems, isOpen });
        if (isOpen) {
          groupItems.forEach((d, i) =>
            items.push({
              type: 'group-child',
              data: d,
              isLast: i === groupItems.length - 1,
            })
          );
        }
      }
    }

    const sortedHidden = sortTokens(hiddenData, 'native-top');
    if (sortedHidden.length > 0) {
      items.push({ type: 'hidden-header', count: sortedHidden.length });
      if (showHidden) {
        sortedHidden.forEach((d) =>
          items.push({ type: 'hidden-token', data: d })
        );
      }
    }

    return items;
  }, [data, hiddenData, openGroups, showHidden]);

  const virtualizer = useVirtualizer({
    count: flatItems.length,
    getScrollElement: () => scrollElement,
    estimateSize: (index) => {
      const item = flatItems[index];
      if (item.type === 'hidden-header') return HIDDEN_HEADER_HEIGHT;
      if (item.type === 'group-child') return GROUP_CHILD_HEIGHT;
      return ITEM_HEIGHT;
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
            {item.type === 'group-header' ? (
              <GroupHeader
                items={item.items}
                isOpen={item.isOpen}
                onToggle={() => toggleGroup(item.symbol)}
              />
            ) : item.type === 'group-child' ? (
              <div
                className={cn(
                  'pl-3 border-l-2 border-foreground/5',
                  item.isLast && 'pb-1'
                )}
              >
                <FungibleItem
                  data={item.data}
                  onClick={onTokenClick}
                  symbolOnly
                />
              </div>
            ) : item.type === 'hidden-header' ? (
              <button
                onClick={() => setShowHidden((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
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
