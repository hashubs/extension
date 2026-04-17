import { SanitizedPortfolio } from '@/shared/fungible/sanitize-portfolio';
import { formatFiat } from '@/shared/units/format-fiat';
import { formatPercentDisplay } from '@/shared/units/format-percent';
import { formatTokenAmount } from '@/shared/units/format-token';
import { useFiatConversion } from '@/ui/hooks/useFiatConversion';
import { cn } from '@/ui/lib/utils';
import { Image } from '@/ui/ui-kit';
import { memo } from 'react';
import { ChainBadge } from './ChainBadge';

interface FungibleItemProps {
  data: SanitizedPortfolio;
  onClick?: (data: SanitizedPortfolio) => void;
  symbolOnly?: boolean;
  hiddenBadge?: boolean;
}

export const FungibleItem = memo(
  ({
    data,
    onClick,
    symbolOnly = false,
    hiddenBadge = false,
  }: FungibleItemProps) => {
    const change = isNaN(data.priceChange) ? 0 : data.priceChange;

    const isNeutral = change === null || change === undefined || change === 0;
    const positive = !isNeutral && change > 0;

    const { convertUsdToFiat, defaultCurrency } = useFiatConversion();

    return (
      <div
        role="button"
        className="flex items-center justify-between p-2.5 rounded-[17px] cursor-pointer bg-item border border-border/20 hover:bg-black/5! dark:hover:bg-white/5!"
        onClick={() => onClick?.(data)}
      >
        <div className="flex items-center gap-3">
          <div className="relative size-[42px] rounded-full flex items-center justify-center shrink-0 font-bold text-[18px] bg-muted/80 border border-border/20">
            <Image
              src={data.logoUrl}
              alt={data.symbol}
              className="size-7 rounded-full border border-muted/20"
            />
            {!hiddenBadge && <ChainBadge caip={data.assetId} />}
          </div>
          <div>
            <p className="truncate max-w-[150px] text-sm font-medium">
              {symbolOnly ? data.symbol : data.name}
            </p>
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'flex items-center font-[12px] gap-0.5',
                  isNeutral
                    ? 'text-muted-foreground'
                    : positive
                    ? 'text-[#4ade80]'
                    : 'text-[#f87171]'
                )}
              >
                {formatPercentDisplay(change)}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-foreground text-sm font-medium">
            {formatFiat(convertUsdToFiat(data.valueUsd), defaultCurrency)}
          </p>
          <p className="text-muted-foreground truncate max-w-[150px] text-[12px] m-0">
            {formatTokenAmount(data.amount, data.symbol)}
          </p>
        </div>
      </div>
    );
  }
);
