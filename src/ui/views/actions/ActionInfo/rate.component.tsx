import type { ActionRate } from '@/shared/request/types/wallet-get-actions';
import { formatTokenAmount } from '@/shared/units/format-token';

export function RateComponent({ rate }: { rate: ActionRate }) {
  if (!rate || rate.length < 2) return null;

  return (
    <div className="flex items-center justify-between px-2.5 py-2.5 w-full">
      <span className="text-[14px] text-muted-foreground">Rate</span>
      <span className="text-[14px] font-bold text-foreground text-right">
        {`${formatTokenAmount(rate[0].value, '')} ${
          rate[0].symbol
        } = ${formatTokenAmount(rate[1].value, '')} ${rate[1].symbol}`}
      </span>
    </div>
  );
}
