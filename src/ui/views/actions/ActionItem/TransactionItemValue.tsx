import type { Fungible } from '@/shared/request/types/fungible';
import type {
  ActionDirection,
  ActionType,
  Amount,
  Approval,
  NFTPreview,
  Transfer,
} from '@/shared/request/types/wallet-get-actions';
import { formatFiat } from '@/shared/units/format-fiat';
import { formatTokenAmount } from '@/shared/units/format-token';
import { useFiatConversion } from '@/ui/hooks/useFiatConversion';
import { cn } from '@/ui/lib/utils';
import { useMemo } from 'react';

function getSign(
  decimaledValue?: number | string,
  direction?: ActionDirection | null
) {
  if (!decimaledValue || !direction) {
    return '';
  }
  return direction === 'in' ? '+' : '−';
}

export function HistoryTokenValue({
  amount,
  fungible,
  direction,
  kind,
}: {
  actionType?: ActionType;
  amount: Amount | null;
  fungible: Fungible | null | undefined;
  direction: ActionDirection | null;
  withLink: boolean;
  kind: 'body' | 'small';
}) {
  const sign = getSign(amount?.value || 0, direction);

  const formattedAmount = useMemo(() => {
    if (!amount?.quantity) return null;
    return formatTokenAmount(amount.quantity, '', {
      decimals: 0,
      compact: true,
    });
  }, [amount?.quantity]);

  return (
    <div
      className={cn(
        'flex items-center justify-end gap-1 overflow-hidden whitespace-nowrap'
      )}
    >
      <span className={cn(kind === 'body' ? 'text-sm font-medium' : 'text-xs')}>
        {sign}
        {formattedAmount}
      </span>
      <span
        className={cn(
          kind === 'body' ? 'text-sm' : 'text-xs'
          // "text-muted-foreground",
        )}
      >
        {fungible?.symbol || 'TOKEN'}
      </span>
    </div>
  );
}

export function HistoryNFTValue({
  amount,
  nft,
  direction,
  kind,
}: {
  amount: Amount | null;
  nft: NFTPreview | null | undefined;
  direction: ActionDirection | null;
  withLink?: boolean;
  kind: 'body' | 'small';
}) {
  const sign = getSign(amount?.value || 0, direction);
  const quantity = amount?.quantity;

  const formattedValue = useMemo(() => {
    if (!quantity) return null;
    return `${sign}${formatTokenAmount(quantity, '', { compact: true })}`;
  }, [quantity, sign]);

  return (
    <div className="flex items-center justify-end gap-1 overflow-hidden whitespace-nowrap">
      {quantity && Number(quantity) > 1 && (
        <span
          className={cn(kind === 'body' ? 'text-sm font-medium' : 'text-xs')}
        >
          {formattedValue}
        </span>
      )}
      <span className={cn(kind === 'body' ? 'text-sm' : 'text-xs')}>
        {nft?.metadata?.name || 'NFT'}
      </span>
    </div>
  );
}

export function HistoryItemValue({
  actionType,
  transfers,
  withLink,
  kind,
}: {
  actionType: ActionType;
  transfers?: Transfer[];
  withLink: boolean;
  kind: 'body' | 'small';
}) {
  if (!transfers?.length) return null;

  if (transfers.length > 1) {
    return (
      <span className={cn(kind === 'body' ? 'text-sm font-medium' : 'text-xs')}>
        {transfers[0].direction === 'out' ? '−' : '+'}
        {transfers.length} assets
      </span>
    );
  }

  const transfer = transfers[0];

  if (transfer.nft) {
    return (
      <HistoryNFTValue
        nft={transfer.nft}
        direction={transfer.direction}
        amount={transfer.amount}
        withLink={withLink}
        kind={kind}
      />
    );
  }

  if (transfer.fungible) {
    return (
      <HistoryTokenValue
        actionType={actionType}
        amount={transfer.amount}
        fungible={transfer.fungible as unknown as Fungible}
        direction={transfer.direction}
        withLink={withLink}
        kind={kind}
      />
    );
  }

  return null;
}

export function HistoryApprovalValue({ approvals }: { approvals: Approval[] }) {
  if (!approvals.length) return null;

  if (approvals.length > 1) {
    return <span className="text-sm">{approvals.length} assets</span>;
  }

  const approval = approvals[0];

  if (approval.nft) {
    return (
      <span className="text-sm">{approval.nft.metadata?.name || 'NFT'}</span>
    );
  }

  if (approval.fungible) {
    return (
      <span className="text-sm">
        {approval.fungible.name || approval.fungible.symbol}
      </span>
    );
  }

  if (approval.collection) {
    return <span className="text-sm">{approval.collection.name}</span>;
  }

  return null;
}

export function TransactionCurrencyValue({
  transfers,
  kind,
}: {
  transfers?: Transfer[];
  currency: string;
  kind: 'body' | 'small';
}) {
  const { convertUsdToFiat, defaultCurrency } = useFiatConversion();

  if (transfers?.length !== 1) return null;
  const transfer = transfers[0];
  if (transfer.amount?.value == null) return null;

  const value = formatFiat(
    convertUsdToFiat(transfer.amount.value),
    defaultCurrency
  );

  return (
    <span
      className={cn(
        kind === 'body' ? 'text-sm' : 'text-xs',
        'text-muted-foreground'
      )}
    >
      {value}
    </span>
  );
}
