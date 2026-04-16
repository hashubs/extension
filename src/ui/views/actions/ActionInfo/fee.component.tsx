import type { AnyAddressAction } from '@/modules/ethereum/transactions/addressAction';
import { formatFiat } from '@/shared/units/format-fiat';
import { formatTokenAmount } from '@/shared/units/format-token';
import { useFiatConversion } from '@/ui/hooks/useFiatConversion';

export function FeeComponent({
  fee,
}: {
  fee: NonNullable<AnyAddressAction['fee']>;
}) {
  const { convertUsdToFiat, defaultCurrency } = useFiatConversion();

  const quantity = fee.amount.quantity;
  const symbol = fee.fungible?.symbol || 'ETH';

  const valueFiat =
    fee.amount.value != null
      ? formatFiat(convertUsdToFiat(fee.amount.value), defaultCurrency)
      : null;

  return (
    <div className="flex items-center justify-between px-2.5 py-2.5 w-full">
      <span className="text-[14px] text-muted-foreground">Network Fee</span>
      <div className="flex items-center gap-1.5 text-[14px] font-bold text-right text-foreground">
        {fee.free ? (
          <span className="bg-linear-to-r from-[#6C6CF9] to-[#FF7583] bg-clip-text text-transparent">
            Free
          </span>
        ) : (
          <>
            <span>{formatTokenAmount(quantity, '')}</span>
            <span>{symbol}</span>
            {valueFiat != null && (
              <span className="text-muted-foreground font-normal">
                {valueFiat}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
