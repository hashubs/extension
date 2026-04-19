import { parseCaip19 } from '@/modules/networks/helpers';
import { getChainLogo } from '@/shared/chains/chain-logos';
import { cn } from '@/ui/lib/utils';
import { memo } from 'react';

interface ChainBadgeProps {
  caip: string;
  width?: number;
  height?: number;
  chainName?: string;
  className?: string;
}

export const ChainBadge = memo(function ChainBadge({
  caip,
  width,
  height,
  className,
}: ChainBadgeProps) {
  const parsed = parseCaip19(caip);
  const parsedId = parsed?.caip ?? caip;
  const chainLogo = getChainLogo(parsedId);
  return (
    <div
      className={cn(
        'flex justify-center items-center size-[18px] absolute -bottom-0.5 -right-0.5 rounded-full bg-muted/40 p-px border border-muted/40',
        className
      )}
    >
      <img
        src={chainLogo}
        alt="logo-chain"
        width={width}
        height={height}
        className="rounded-full w-full h-auto"
      />
    </div>
  );
});
