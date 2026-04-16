import { SanitizedPortfolio } from '@/shared/fungible/sanitize-portfolio';
import { groupTokensBySymbol } from '@/shared/fungible/tokens-group';
import { SortOption, sortTokens } from '@/shared/fungible/tokens-sort';
import { cn } from '@/ui/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/ui/ui-kit';
import { useState } from 'react';
import { IoChevronDown, IoEyeOff } from 'react-icons/io5';
import { FungibleItem } from './FungibleItem';
import { FungibleListSkeleton } from './FungibleSkeleton';
import { GroupedTokenItem } from './GroupedTokenItem';

interface FungibleListProps {
  data: SanitizedPortfolio[];
  hiddenData: SanitizedPortfolio[];
  sortOrder: SortOption;
  isLoading?: boolean;
  grouped?: boolean;
  hiddenBadge?: boolean;
  onTokenClick?: (token: SanitizedPortfolio) => void;
}

export function FungibleList({
  data,
  hiddenData,
  sortOrder,
  isLoading,
  grouped = false,
  hiddenBadge = false,
  onTokenClick,
}: FungibleListProps) {
  const [showHidden, setShowHidden] = useState(false);

  const sortedData = sortTokens(data, sortOrder);
  const sortedHiddenData = sortTokens(hiddenData, sortOrder);

  const renderItems = () => {
    if (isLoading) {
      return <FungibleListSkeleton count={3} />;
    }
    if (sortedData.length === 0) {
      return (
        <div className="text-center py-8 text-foreground/40 text-sm">
          No assets found
        </div>
      );
    }

    if (grouped) {
      const groupMap = groupTokensBySymbol(sortedData);
      return [...groupMap.entries()].map(([symbol, data]) => (
        <GroupedTokenItem
          key={symbol}
          data={data}
          onTokenClick={onTokenClick}
        />
      ));
    }

    return sortedData.map((data) => (
      <FungibleItem
        key={`${data.assetId}-${data.address}`}
        data={data}
        onClick={onTokenClick}
        hiddenBadge={hiddenBadge}
      />
    ));
  };

  return (
    <div className="flex flex-col gap-2">
      {renderItems()}

      {sortedHiddenData.length > 0 && (
        <Collapsible open={showHidden} onOpenChange={setShowHidden}>
          <CollapsibleTrigger
            className={cn(
              'w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors'
            )}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IoEyeOff className="w-4 h-4" />
              <span>Hidden Tokens</span>
              <span className="px-2 py-0.5 text-xs bg-muted rounded-full">
                {sortedHiddenData.length}
              </span>
            </div>
            <IoChevronDown
              className={cn(
                'w-4 h-4 text-muted-foreground transition-transform duration-200',
                showHidden ? 'rotate-180' : ''
              )}
            />
          </CollapsibleTrigger>

          <CollapsibleContent className="flex flex-col space-y-3 mt-3">
            {sortedHiddenData.map((data) => (
              <FungibleItem
                key={`${data.assetId}-${data.address}`}
                data={data}
                onClick={onTokenClick}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
