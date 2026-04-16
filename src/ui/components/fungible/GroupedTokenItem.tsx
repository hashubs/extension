import { getChainLogo } from '@/shared/chains/chain-logos';
import { SanitizedPortfolio } from '@/shared/fungible/sanitize-portfolio';
import { formatFiat } from '@/shared/units/format-fiat';
import { formatTokenAmount } from '@/shared/units/format-token';
import { useFiatConversion } from '@/ui/hooks/useFiatConversion';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Image,
} from '@/ui/ui-kit';
import { useState } from 'react';
import { IoChevronDown } from 'react-icons/io5';
import { FungibleItem } from './FungibleItem';

interface GroupedTokenItemProps {
  data: SanitizedPortfolio[];
  onTokenClick?: (token: SanitizedPortfolio) => void;
}

export function GroupedTokenItem({
  data,
  onTokenClick,
}: GroupedTokenItemProps) {
  const [open, setOpen] = useState(false);
  const { convertUsdToFiat, defaultCurrency } = useFiatConversion();

  if (data.length === 0) return null;

  if (data.length === 1) {
    return <FungibleItem data={data[0]} onClick={onTokenClick} />;
  }

  const first = data[0];

  const totalValueUsd = data.reduce((sum, h) => sum + h.valueUsd, 0);
  const totalAmount = data.reduce((sum, h) => sum + Number(h.amount), 0);

  const previewChains = data.slice(0, 4);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        render={
          <div
            role="button"
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
                    className="size-3 text-white transition-transform duration-200"
                    style={{
                      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </div>
              </div>

              <div>
                <p className="font-semibold text-sm">{first.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {previewChains.map((h) => {
                    const assetId = h.assetId;
                    const cLogo = getChainLogo(assetId);
                    return (
                      <div
                        key={assetId}
                        className="size-[14px] rounded-full overflow-hidden bg-foreground/10 border border-foreground/10 flex items-center justify-center"
                      >
                        <Image
                          src={cLogo}
                          alt={`chain-${h.assetId}`}
                          className="size-full object-contain"
                        />
                      </div>
                    );
                  })}
                  {data.length > 4 && (
                    <span className="text-[10px] text-foreground/40 ml-0.5">
                      +{data.length - 4}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-foreground font-semibold text-sm">
                {formatFiat(convertUsdToFiat(totalValueUsd), defaultCurrency)}
              </p>
              <p className="text-muted-foreground text-[12px] m-0">
                {formatTokenAmount(totalAmount, first.symbol)}
              </p>
            </div>
          </div>
        }
      />

      <CollapsibleContent>
        <div className="flex flex-col gap-2 mt-2 pl-3 border-l-2 border-foreground/5">
          {data.map((h) => (
            <FungibleItem
              key={h.assetId}
              data={h}
              onClick={onTokenClick}
              symbolOnly={true}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
