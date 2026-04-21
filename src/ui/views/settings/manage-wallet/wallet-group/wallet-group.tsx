import { walletPort } from '@/shared/channel';
import { invariant } from '@/shared/invariant';
import {
  isHardwareContainer,
  isMnemonicContainer,
  isSignerContainer,
} from '@/shared/types/validators';
import { WalletGroup } from '@/shared/types/wallet-group';
import { formatFiatToParts } from '@/shared/units/format-fiat';
import { BLOCKCHAIN_TYPES } from '@/shared/wallet/classifiers';
import { BackupInfoNote } from '@/ui/components/BackupInfoNote';
import { BlockieAddress } from '@/ui/components/Blockie';
import { ConfirmationSheet } from '@/ui/components/Confirmation/confirmation-sheet';
import { Header } from '@/ui/components/header';
import { ViewLoading } from '@/ui/components/view-loading';
import { ViewNotFound } from '@/ui/components/view-not-found';
import { getGroupDisplayName } from '@/ui/components/wallet/WalletDisplayName/getGroupDisplayName';
import {
  useWalletGroupByGroupId,
  useWalletGroupsByGroupId,
  WALLET_GROUP_QUERY_KEY,
  WALLET_GROUPS_QUERY_KEY,
} from '@/ui/hooks/request/internal/useWalletGroups';
import { useDebouncedCallback } from '@/ui/hooks/useDebouncedCallback';
import { useFiatConversion } from '@/ui/hooks/useFiatConversion';
import { truncateAddress } from '@/ui/lib/utils';
import { Card, CardItem, NeutralDecimals } from '@/ui/ui-kit';
import { ItemType } from '@/ui/ui-kit/card';
import { InputDecorator } from '@/ui/ui-kit/input/Input-decorator';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useId, useMemo, useState } from 'react';
import { IoKeyOutline } from 'react-icons/io5';
import { LuChevronRight, LuKey, LuPlus, LuTrash } from 'react-icons/lu';
import {
  MdOutlineAccountBalanceWallet,
  MdOutlineBackup,
  MdOutlineGroupRemove,
} from 'react-icons/md';
import { PiSpinnerLight } from 'react-icons/pi';
import { useNavigate, useParams } from 'react-router-dom';
import { groupByEcosystem } from '../_shared/groupByEcosystem';
import { queryClient } from '@/shared/query-client/queryClient';

function EditableWalletGroupName({
  id,
  walletGroup,
  onRename,
}: {
  id?: string;
  walletGroup: WalletGroup;
  onRename?: () => void;
}) {
  const [value, setValue] = useState(walletGroup.name);
  const { mutate, ...renameMutation } = useMutation({
    mutationFn: (value: string) =>
      walletPort.request('renameWalletGroup', {
        groupId: walletGroup.id,
        name: value,
      }),
    onSuccess() {
      onRename?.();
    },
  });
  const debouncedRenameRequest = useDebouncedCallback(
    useCallback((value: string) => mutate(value), [mutate]),
    500
  );
  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-[1fr_auto] items-center gap-1">
        <input
          id={id}
          placeholder="Group Name"
          type="text"
          value={value}
          onChange={(event) => {
            const name = event.target.value;
            debouncedRenameRequest(name);
            setValue(name);
          }}
          className="outline-none focus:outline-none focus:ring-0"
        />
        {renameMutation.isPending ? (
          <PiSpinnerLight className="inline-block animate-spin" />
        ) : null}
      </div>
      {renameMutation.isError ? (
        <span className="text-xs text-red-500">
          {(renameMutation.error as Error | null)?.message || 'Unknown Error'}
        </span>
      ) : null}
    </div>
  );
}

function WalletGroupItem({
  wallet,
}: {
  wallet: WalletGroup['walletContainer']['wallets'][number] & {
    valueUsd: number;
    groupId: string;
  };
}) {
  const navigate = useNavigate();
  const { convertUsdToFiat, defaultCurrency } = useFiatConversion();

  return (
    <CardItem
      item={{
        iconNode: (
          <BlockieAddress address={wallet.address} size={32} borderRadius={4} />
        ),
        iconClassName: 'rounded-md',
        label: truncateAddress(wallet.address),
        subLabelElement: (
          <span className="text-xs text-muted-foreground">
            <NeutralDecimals
              parts={formatFiatToParts(
                convertUsdToFiat(wallet.valueUsd),
                defaultCurrency
              )}
            />
          </span>
        ),
        onClick: () =>
          navigate(
            `/settings/manage-wallets/accounts/${wallet.address}?groupId=${wallet.groupId}`
          ),
        iconRight: LuChevronRight,
      }}
    />
  );
}

function WalletGroupItems({ group }: { group: WalletGroup }) {
  const { wallets } = group.walletContainer;
  const byEcosystem = useMemo(() => groupByEcosystem(wallets), [wallets]);

  const walletSections = useMemo(() => {
    return BLOCKCHAIN_TYPES.map((blockchainType) => {
      const ecosystemWallets = byEcosystem[blockchainType];
      if (!ecosystemWallets || ecosystemWallets.length === 0) return null;

      return {
        title: blockchainType === 'evm' ? 'Ethereum Wallet' : 'Solana Wallet',
        wallets: ecosystemWallets,
      };
    }).filter(Boolean) as Array<{
      title: string;
      wallets: typeof wallets;
    }>;
  }, [byEcosystem]);

  return walletSections.map((section, i) => (
    <div key={i}>
      <Card title={section.title}>
        {section.wallets.map((wallet, j) => (
          <WalletGroupItem
            key={j}
            wallet={{ ...wallet, groupId: group.id, valueUsd: 0 }}
          />
        ))}
      </Card>
    </div>
  ));
}

export function WalletGroupView() {
  const navigate = useNavigate();
  const { groupId } = useParams();
  invariant(groupId, 'Group Id is required for this view');

  const [removeGroupOpen, setRemoveGroupOpen] = useState(false);

  const {
    data: walletGroup,
    isLoading: walletGroupIsLoading,
    refetch: refetchWalletGroup,
  } = useWalletGroupByGroupId({
    groupId,
  });

  const groupInputId = useId();
  const { data: allGroups, refetch } = useWalletGroupsByGroupId();

  const removeWalletGroupMutation = useMutation({
    mutationFn: () => walletPort.request('removeWalletGroup', { groupId }),
    onSuccess() {
      refetch();
      navigate('/settings/manage-wallets');
      queryClient.invalidateQueries({
        queryKey: WALLET_GROUPS_QUERY_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: WALLET_GROUP_QUERY_KEY,
      });
    },
  });

  if (walletGroupIsLoading) {
    return <ViewLoading onBack={() => navigate('/settings/manage-wallets')} />;
  }

  if (!walletGroup) {
    return (
      <ViewNotFound
        title="Wallet Group Not Found"
        onBack={() => navigate('/settings/manage-wallets')}
      />
    );
  }

  const handleRemoveGroup = () => {
    removeWalletGroupMutation.mutate();
    setRemoveGroupOpen(false);
  };

  const { walletContainer } = walletGroup;
  const isSignerGroup = isSignerContainer(walletContainer);
  const isMnemonicGroup = isMnemonicContainer(walletContainer);
  const isHardwareGroup = isHardwareContainer(walletContainer);

  const items: ItemType[] = [
    {
      label: 'Add New Wallet',
      icon: LuPlus,
      iconRight: LuChevronRight,
      onClick: () =>
        navigate(
          `/settings/manage-wallets/add/import/mnemonic?groupId=${walletGroup.id}`
        ),
    },
    isSignerGroup
      ? {
          label: 'Recovery Phrase',
          icon: LuKey,
          iconRight: LuChevronRight,
          subLabelElement: <BackupInfoNote group={walletGroup} />,
          onClick: () =>
            navigate(
              `/settings/manage-wallets/recovery-phrase/${walletGroup.id}`
            ),
        }
      : null,
    {
      label: 'Remove Group',
      icon: LuTrash,
      variant: 'danger',
      disabled: allGroups ? allGroups.length <= 1 : true,
      onClick: () => {
        if (allGroups && allGroups.length <= 1) return;
        setRemoveGroupOpen(true);
      },
    },
  ].filter(Boolean) as ItemType[];

  return (
    <div className="flex flex-col h-full">
      <Header
        title={getGroupDisplayName(walletGroup.name)}
        onBack={() =>
          navigate('/settings/manage-wallets', {
            state: { direction: 'back', openGroupId: walletGroup.id },
          })
        }
      />

      <div className="flex-1 p-4 pt-0! space-y-4 overflow-y-auto no-scrollbar">
        {isMnemonicGroup || isHardwareGroup ? (
          <InputDecorator
            label="Name"
            htmlFor={groupInputId}
            className="bg-item"
            input={
              <EditableWalletGroupName
                id={groupInputId}
                walletGroup={walletGroup}
                onRename={refetchWalletGroup}
              />
            }
          />
        ) : null}

        <WalletGroupItems group={walletGroup} />

        <Card>
          {items.map((item, i) => (
            <CardItem key={i} item={item} />
          ))}
        </Card>
      </div>

      <ConfirmationSheet
        open={removeGroupOpen}
        onOpenChange={setRemoveGroupOpen}
        onConfirm={handleRemoveGroup}
        title="Remove Wallet Group"
        heroGradient="from-red-500 to-orange-500"
        heroShadow="shadow-red-500/20"
        heading="Before you proceed"
        confirmLabel="Remove Wallet Group"
        heroIcon={<MdOutlineGroupRemove className="w-8 h-8 text-white" />}
        items={[
          {
            icon: IoKeyOutline,
            className: 'text-red-400',
            text: 'Your Secret Recovery Phrase will be permanently deleted from Selvo. This cannot be undone.',
          },
          {
            icon: MdOutlineAccountBalanceWallet,
            className: 'text-yellow-400',
            text: 'All wallet addresses in this group will be removed along with their private keys.',
          },
          {
            icon: MdOutlineBackup,
            className: 'text-green-400',
            text: "Back up your Recovery Phrase now — it's the only way to restore all wallets in this group.",
          },
        ]}
      />
    </div>
  );
}
