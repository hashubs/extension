import type { AnyAddressAction } from '@/modules/ethereum/transactions/addressAction';
import type {
  ActionDirection,
  ActionType,
  Amount,
} from '@/shared/request/types/wallet-get-actions';
import { formatFiat } from '@/shared/units/format-fiat';
import { formatTokenAmount } from '@/shared/units/format-token';
import { useFiatConversion } from '@/ui/hooks/useFiatConversion';
import { cn } from '@/ui/lib/utils';
import { Card } from '@/ui/ui-kit';
import { useMemo } from 'react';
import { HistoryAssetIcon } from '../ActionItem/TransactionTypeIcon';
import { DateComponent } from './date.component';
import { ExplorerComponent } from './explorer.component';
import { FeeComponent } from './fee.component';
import { LabelComponent } from './label.component';
import { RateComponent } from './rate.component';

function AssetContent({
  fungible,
  nft,
  collection,
  direction,
  amount,
  unlimited,
  type,
}: {
  fungible: any;
  nft: any;
  collection: any;
  direction: ActionDirection | null;
  amount: Amount | null;
  unlimited?: boolean;
  type: ActionType;
}) {
  const { convertUsdToFiat, defaultCurrency } = useFiatConversion();

  const formattedAmount = useMemo(() => {
    if (unlimited) return 'Unlimited';
    if (!amount?.quantity) return '0';
    return formatTokenAmount(amount.quantity, '', {
      decimals: 0,
      compact: false,
    });
  }, [amount?.quantity, unlimited]);

  const valueFiat =
    amount?.value != null
      ? formatFiat(convertUsdToFiat(amount.value), defaultCurrency)
      : null;

  const symbol =
    fungible?.symbol || nft?.metadata?.name || collection?.name || 'Asset';

  return (
    <div className="flex items-center gap-3 py-1">
      <div className="size-10 shrink-0">
        <HistoryAssetIcon
          fungible={fungible}
          nft={nft}
          collection={collection}
          type={type}
          size={40}
        />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={cn(
              'text-[18px] font-bold leading-tight truncate max-w-full',
              direction === 'in' ? 'text-[#4ade80]' : 'text-muted-foreground'
            )}
          >
            {direction === 'out' ? '-' : direction === 'in' ? '+' : ''}
            {formattedAmount} {symbol}
          </span>
        </div>
        {valueFiat && (
          <span className="text-[13px] text-muted-foreground leading-tight mt-0.5">
            {valueFiat}
          </span>
        )}
      </div>
    </div>
  );
}

function TransferDivider() {
  return (
    <div className="relative h-4 w-[calc(100%+24px)] -left-3 my-2">
      <div className="absolute top-[5.5px] left-[4px] right-[4px] h-px bg-border" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 rotate-45 size-3 border-r border-b border-border bg-white dark:bg-[#1f1f1f]" />
    </div>
  );
}

function ActContent({
  act,
  showActType,
}: {
  act: NonNullable<AnyAddressAction['acts']>[number];
  showActType: boolean;
}) {
  const approvals = act.content?.approvals || [];
  const transfers = act.content?.transfers || [];
  const incomingTransfers = transfers.filter((t) => t.direction === 'in');
  const outgoingTransfers = transfers.filter((t) => t.direction === 'out');

  if (approvals.length === 0 && transfers.length === 0) {
    return null;
  }

  return (
    <Card className="py-2 divide-none">
      {showActType && (
        <div className="px-2.5 text-[13px] font-bold text-muted-foreground pb-1 uppercase tracking-wider">
          {act.type.displayValue}
        </div>
      )}

      {approvals.length > 0 && (
        <div className="flex flex-col gap-2 px-2.5">
          {!showActType && (
            <div className="text-[14px] text-muted-foreground pb-1 leading-none pt-1 px-1">
              Allow to spend
            </div>
          )}
          {approvals.map((app, i) => (
            <AssetContent
              key={`app-${i}`}
              fungible={app.fungible}
              nft={app.nft}
              collection={app.collection}
              direction={null}
              amount={app.amount}
              unlimited={app.unlimited}
              type={act.type.value}
            />
          ))}
        </div>
      )}

      {outgoingTransfers.length > 0 && (
        <div className="flex flex-col gap-2 px-2.5">
          {!showActType && (
            <div className="text-[14px] text-muted-foreground pb-1 leading-none pt-1 px-1">
              Sent
            </div>
          )}
          {outgoingTransfers.map((t, i) => (
            <AssetContent
              key={`out-${i}`}
              fungible={t.fungible}
              nft={t.nft}
              collection={null}
              direction={t.direction}
              amount={t.amount}
              type={act.type.value}
            />
          ))}
        </div>
      )}

      {outgoingTransfers.length > 0 && incomingTransfers.length > 0 && (
        <TransferDivider />
      )}

      {incomingTransfers.length > 0 && (
        <div className="flex flex-col gap-2 px-2.5">
          {!showActType && (
            <div className="text-[14px] text-muted-foreground pb-1 leading-none pt-1 px-1">
              Received
            </div>
          )}
          {incomingTransfers.map((t, i) => (
            <AssetContent
              key={`in-${i}`}
              fungible={t.fungible}
              nft={t.nft}
              collection={null}
              direction={t.direction}
              amount={t.amount}
              type={act.type.value}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

export function ActionInfo({
  addressAction,
}: {
  addressAction: AnyAddressAction;
}) {
  const acts = addressAction.acts || [];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {acts.length > 0 ? (
          acts.map((act, i) => (
            <ActContent key={i} act={act} showActType={acts.length > 1} />
          ))
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No actions found
          </div>
        )}
      </div>

      <div className="flex flex-col divide-y divide-border">
        {addressAction.transaction && (
          <ExplorerComponent transaction={addressAction.transaction} />
        )}
        {addressAction.label && <LabelComponent label={addressAction.label} />}
        {'rate' in addressAction && (addressAction as any).rate && (
          <RateComponent rate={(addressAction as any).rate} />
        )}
        {addressAction.fee && <FeeComponent fee={addressAction.fee} />}

        <DateComponent timestamp={addressAction.timestamp} />
      </div>
    </div>
  );
}
