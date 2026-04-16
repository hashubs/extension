import type { AnyAddressAction } from '@/modules/ethereum/transactions/addressAction';
import { Fungible } from '@/shared/request/types/fungible';
import type {
  ActionType,
  Approval,
  Collection,
  NFTPreview,
  Transfer,
} from '@/shared/request/types/wallet-get-actions';
import { useMemo } from 'react';
import { CgLockUnlock } from 'react-icons/cg';
import {
  LuArrowDownLeft,
  LuArrowDownToLine,
  LuArrowUpFromLine,
  LuArrowUpRight,
  LuCircleCheck,
  LuCircleHelp,
  LuCircleX,
  LuFlame,
  LuGift,
  LuLayers,
  LuLayers2,
  LuLayers3,
  LuLock,
  LuPlus,
  LuRepeat,
  LuRocket,
  LuShieldAlert,
  LuSquareTerminal,
} from 'react-icons/lu';
import { AssetIcon } from './AssetIcon';

export const TRANSACTION_ICON_SIZE = 36;
export const TRANSACTION_SMALL_ICON_SIZE = 27;
export const transactionIconStyle = {
  width: TRANSACTION_ICON_SIZE,
  height: TRANSACTION_ICON_SIZE,
};

export function TransactionTypeIcon({
  type,
  size,
}: {
  type: ActionType;
  size?: number;
}) {
  const containerSize = size || TRANSACTION_ICON_SIZE;
  const iconSize = containerSize * 0.6; // Adjust size to fit in circle

  const style = useMemo(
    () => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#282a2d',
      borderRadius: '50%',
      width: containerSize,
      height: containerSize,
      color: '#fff',
    }),
    [containerSize]
  );

  const iconProps = {
    size: iconSize,
    strokeWidth: 2,
  };

  if (type === 'approve') {
    return (
      <div style={style}>
        <LuCircleCheck {...iconProps} />
      </div>
    );
  }
  if (type === 'borrow') {
    return (
      <div style={style}>
        <LuArrowDownLeft {...iconProps} />
      </div>
    );
  }
  if (type === 'burn') {
    return (
      <div style={style}>
        <LuFlame {...iconProps} />
      </div>
    );
  }
  if (type === 'cancel') {
    return (
      <div style={style}>
        <LuCircleX {...iconProps} />
      </div>
    );
  }
  if (type === 'claim') {
    return (
      <div style={style}>
        <LuGift {...iconProps} />
      </div>
    );
  }
  if (type === 'execute') {
    return (
      <div style={style}>
        <LuSquareTerminal {...iconProps} />
      </div>
    );
  }
  if (type === 'deploy') {
    return (
      <div style={style}>
        <LuRocket {...iconProps} />
      </div>
    );
  }
  if (type === 'deposit') {
    return (
      <div style={style}>
        <LuArrowDownToLine {...iconProps} />
      </div>
    );
  }
  if (type === 'mint') {
    return (
      <div style={style}>
        <LuPlus {...iconProps} />
      </div>
    );
  }
  if (type === 'receive') {
    return (
      <div style={style}>
        <LuArrowDownLeft {...iconProps} />
      </div>
    );
  }
  if (type === 'revoke') {
    return (
      <div style={style}>
        <LuShieldAlert {...iconProps} />
      </div>
    );
  }
  if (type === 'repay') {
    return (
      <div style={style}>
        <LuArrowUpRight {...iconProps} />
      </div>
    );
  }
  if (type === 'send') {
    return (
      <div style={style}>
        <LuArrowUpRight {...iconProps} />
      </div>
    );
  }
  if (type === 'stake') {
    return (
      <div style={style}>
        <LuLock {...iconProps} />
      </div>
    );
  }
  if (type === 'trade') {
    return (
      <div style={style}>
        <LuRepeat {...iconProps} />
      </div>
    );
  }
  if (type === 'unstake') {
    return (
      <div style={style}>
        <CgLockUnlock {...iconProps} />
      </div>
    );
  }
  if (type === 'withdraw') {
    return (
      <div style={style}>
        <LuArrowUpFromLine {...iconProps} />
      </div>
    );
  }

  return (
    <div style={style}>
      <LuCircleHelp {...iconProps} />
    </div>
  );
}

function TransactionMultipleAssetsIcon({
  amount,
  size,
}: {
  amount: number;
  size: number;
}) {
  const iconSize = size * 0.6;
  const style = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#282a2d',
    borderRadius: '50%',
    width: size,
    height: size,
    color: '#fff',
  };

  const iconProps = {
    size: iconSize,
    strokeWidth: 2,
  };

  if (amount === 2) {
    return (
      <div style={style}>
        <LuLayers2 {...iconProps} />
      </div>
    );
  }
  if (amount === 3) {
    return (
      <div style={style}>
        <LuLayers3 {...iconProps} />
      </div>
    );
  }
  return (
    <div style={style}>
      <LuLayers {...iconProps} />
    </div>
  );
}

export function HistoryAssetIcon({
  fungible,
  nft,
  collection,
  type,
  size,
}: {
  fungible: Fungible | null | undefined;
  nft: NFTPreview | null | undefined;
  collection: Collection | null | undefined;
  type: ActionType;
  size: number;
}) {
  if (!fungible && !nft && !collection) {
    return <TransactionTypeIcon type={type} />;
  }

  return (
    <AssetIcon
      fungible={fungible}
      nft={nft}
      collection={collection}
      size={size}
      fallback={<TransactionTypeIcon type={type} size={size} />}
    />
  );
}

function ApprovalIcon({
  approvals,
  type,
  size,
}: {
  approvals: Approval[];
  type: ActionType;
  size: number;
}) {
  if (!approvals.length) {
    return null;
  }
  if (approvals.length > 1) {
    return (
      <TransactionMultipleAssetsIcon amount={approvals.length} size={size} />
    );
  }

  return (
    <HistoryAssetIcon
      // @ts-ignore
      fungible={approvals[0].fungible}
      nft={approvals[0].nft}
      collection={null}
      type={type}
      size={size}
    />
  );
}

function TransferIcon({
  transfers,
  type,
  size,
}: {
  transfers: Transfer[];
  type: ActionType;
  size: number;
}) {
  if (!transfers?.length) {
    return null;
  }
  if (transfers.length > 1) {
    return (
      <TransactionMultipleAssetsIcon amount={transfers.length} size={size} />
    );
  }
  return (
    <HistoryAssetIcon
      // @ts-ignore
      fungible={transfers[0].fungible}
      nft={transfers[0].nft}
      collection={null}
      type={type}
      size={size}
    />
  );
}

export function TransactionItemIcon({
  addressAction,
}: {
  addressAction: AnyAddressAction;
}) {
  const approvals = addressAction.content?.approvals;
  const incomingTransfers = useMemo(
    () => addressAction.content?.transfers?.filter((t) => t.direction === 'in'),
    [addressAction]
  );
  const outgoingTransfers = useMemo(
    () =>
      addressAction.content?.transfers?.filter((t) => t.direction === 'out'),
    [addressAction]
  );

  if (incomingTransfers?.length && outgoingTransfers?.length) {
    return (
      <div
        style={{
          position: 'relative',
          width: TRANSACTION_ICON_SIZE,
          height: TRANSACTION_ICON_SIZE,
        }}
      >
        <div style={{ position: 'absolute', left: 0, top: 0 }}>
          <TransferIcon
            transfers={outgoingTransfers}
            type={addressAction.type.value}
            size={TRANSACTION_SMALL_ICON_SIZE}
          />
        </div>
        <div style={{ position: 'absolute', bottom: 0, right: 0 }}>
          <TransferIcon
            transfers={incomingTransfers}
            type={addressAction.type.value}
            size={TRANSACTION_SMALL_ICON_SIZE}
          />
        </div>
      </div>
    );
  }

  if (incomingTransfers?.length) {
    return (
      <TransferIcon
        transfers={incomingTransfers}
        type={addressAction.type.value}
        size={TRANSACTION_ICON_SIZE}
      />
    );
  }

  if (outgoingTransfers?.length) {
    return (
      <TransferIcon
        transfers={outgoingTransfers}
        type={addressAction.type.value}
        size={TRANSACTION_ICON_SIZE}
      />
    );
  }

  if (approvals) {
    return (
      <ApprovalIcon
        approvals={approvals}
        type={addressAction.type.value}
        size={TRANSACTION_ICON_SIZE}
      />
    );
  }

  return <TransactionTypeIcon type={addressAction.type.value} />;
}
