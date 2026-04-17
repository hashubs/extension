import type { AnyAddressAction } from '@/modules/ethereum/transactions/addressAction';
import { cn, truncateAddress } from '@/ui/lib/utils';
import { useMemo } from 'react';
import { LuCircleX, LuLoader } from 'react-icons/lu';
import {
  HistoryApprovalValue,
  HistoryItemValue,
  TransactionCurrencyValue,
} from './TransactionItemValue';
import { TransactionItemIcon } from './TransactionTypeIcon';

function ActionTitle({ addressAction }: { addressAction: AnyAddressAction }) {
  const titlePrefix = addressAction.status === 'failed' ? 'Failed ' : '';
  const actionTitle = `${titlePrefix}${addressAction.type.displayValue}`;

  return (
    <span className="text-[15px] font-medium text-foreground truncate">
      {actionTitle}
    </span>
  );
}

function ActionLabel({ addressAction }: { addressAction: AnyAddressAction }) {
  const address =
    addressAction.label?.wallet?.address ||
    addressAction.label?.contract?.address;

  const text =
    addressAction.label?.wallet?.name ||
    addressAction.label?.contract?.dapp?.name;

  if (text && text !== address) {
    return <span className="truncate">{text}</span>;
  } else if (address) {
    return <span>{truncateAddress(address, 5)}</span>;
  } else if (addressAction.transaction?.hash) {
    return <span>{truncateAddress(addressAction.transaction.hash, 5)}</span>;
  }
  return null;
}

function ActionDetail({ addressAction }: { addressAction: AnyAddressAction }) {
  const chainInfo = addressAction.transaction?.chain;

  return (
    <div className="flex items-center gap-1.5 min-w-0 mt-[2px]">
      <img
        src={chainInfo?.iconUrl}
        className="size-[14px] rounded-full object-cover shrink-0"
        alt={chainInfo?.name || 'Chain'}
      />
      <div className="text-[13px] text-muted-foreground truncate flex items-center h-[16px] leading-tight mt-px">
        {addressAction.status === 'pending' ? (
          <span className="text-orange-500 font-medium">Pending</span>
        ) : addressAction.status === 'failed' ? (
          <span className="text-red-500 font-medium">Failed</span>
        ) : (
          <ActionLabel addressAction={addressAction} />
        )}
      </div>
    </div>
  );
}

export function ActionItem({
  addressAction,
  onClick,
}: {
  addressAction: AnyAddressAction;
  onClick?: () => void;
}) {
  const incomingTransfers = useMemo(
    () =>
      addressAction.content?.transfers?.filter(
        (transfer) => transfer.direction === 'in'
      ) || [],
    [addressAction]
  );
  const outgoingTransfers = useMemo(
    () =>
      addressAction.content?.transfers?.filter(
        (transfer) => transfer.direction === 'out'
      ) || [],
    [addressAction]
  );
  const approvals = useMemo(
    () => addressAction.content?.approvals || [],
    [addressAction]
  );

  const shouldUsePositiveColor = incomingTransfers.length === 1;

  return (
    <div
      onClick={onClick}
      className="grid gap-6 items-center px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer relative select-none w-full"
      style={{
        height: 66,
        gridTemplateColumns:
          'minmax(min-content, max-content) minmax(100px, max-content)',
        justifyContent: 'space-between',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative shrink-0 flex items-center justify-center">
          {addressAction.status === 'failed' ? (
            <LuCircleX className="w-[36px] h-[36px] text-red-500" />
          ) : addressAction.status === 'pending' ? (
            <LuLoader className="w-[36px] h-[36px] text-blue-500 animate-spin" />
          ) : (
            <TransactionItemIcon addressAction={addressAction} />
          )}
        </div>

        <div className="flex flex-col min-w-0 justify-center">
          <ActionTitle addressAction={addressAction} />
          <ActionDetail addressAction={addressAction} />
        </div>
      </div>

      <div className="flex flex-col items-end shrink-0 justify-center text-right overflow-hidden min-w-[120px]">
        <div
          className={cn(
            'text-sm truncate max-w-full',
            shouldUsePositiveColor ? 'text-green-500' : 'text-foreground'
          )}
        >
          {incomingTransfers.length ? (
            <HistoryItemValue
              actionType={addressAction.type.value}
              transfers={incomingTransfers}
              withLink={false}
              kind="body"
            />
          ) : outgoingTransfers.length ? (
            <HistoryItemValue
              actionType={addressAction.type.value}
              transfers={outgoingTransfers}
              withLink={false}
              kind="body"
            />
          ) : approvals.length ? (
            <HistoryApprovalValue approvals={approvals} />
          ) : null}
        </div>

        <div className="text-xs text-muted-foreground truncate max-w-full mt-0.5 min-h-[16px]">
          {incomingTransfers.length && !outgoingTransfers.length ? (
            <TransactionCurrencyValue
              transfers={incomingTransfers}
              currency="USD"
              kind="small"
            />
          ) : outgoingTransfers.length && !incomingTransfers.length ? (
            <TransactionCurrencyValue
              transfers={outgoingTransfers}
              currency="USD"
              kind="small"
            />
          ) : outgoingTransfers.length ? (
            <HistoryItemValue
              actionType={addressAction.type.value}
              transfers={outgoingTransfers}
              withLink={false}
              kind="small"
            />
          ) : approvals.length === 1 && approvals[0].unlimited ? (
            'Unlimited'
          ) : null}
        </div>
      </div>
    </div>
  );
}
