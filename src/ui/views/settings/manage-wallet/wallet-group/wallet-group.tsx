import { walletPort } from '@/shared/channel';
import { invariant } from '@/shared/invariant';
import { queryClient } from '@/shared/query-client/queryClient';
import { useToastStore } from '@/shared/store/useToastStore';
import {
  isHardwareContainer,
  isMnemonicContainer,
  isSignerContainer,
} from '@/shared/types/validators';
import { WalletGroup } from '@/shared/types/wallet-group';
import { formatFiatToParts } from '@/shared/units/format-fiat';
import { BLOCKCHAIN_TYPES } from '@/shared/wallet/classifiers';
import { BackupInfoNote, needsBackup } from '@/ui/components/backup-info-note';
import { BlockieAddress } from '@/ui/components/blockie';
import { ConfirmationSheet } from '@/ui/components/confirmation';
import { Layout } from '@/ui/components/layout';
import { ViewLoading } from '@/ui/components/view-loading';
import { ViewNotFound } from '@/ui/components/view-not-found';
import { getGroupDisplayName, WalletDisplayName } from '@/ui/components/wallet';
import { groupByEcosystem } from '@/ui/components/wallet/groupByEcosystem';
import {
  QUERY_WALLET,
  useWalletGroupByGroupId,
  useWalletGroups,
} from '@/ui/hooks/request/internal/useWallet';
import { useDebouncedCallback } from '@/ui/hooks/useDebouncedCallback';
import { useFiatConversion } from '@/ui/hooks/useFiatConversion';
import { Card, CardItem, NeutralDecimals } from '@/ui/ui-kit';
import { ItemType } from '@/ui/ui-kit/card';
import { InputDecorator } from '@/ui/ui-kit/input/Input-decorator';
import { ADD_WALLET_ROUTES } from '@/ui/views/add-wallet';
import { BACKUP_WALLET_ROUTES } from '@/ui/views/backup-wallet';
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
        label: <WalletDisplayName wallet={wallet} />,
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

  const { show: showToast } = useToastStore();

  const {
    data: walletGroup,
    isLoading: walletGroupIsLoading,
    refetch: refetchWalletGroup,
  } = useWalletGroupByGroupId({
    groupId,
  });

  const { data: allGroups } = useWalletGroups();

  const groupInputId = useId();

  const removeWalletGroupMutation = useMutation({
    mutationFn: () => walletPort.request('removeWalletGroup', { groupId }),
    onSuccess() {
      navigate('/settings/manage-wallets');
      showToast('Remove wallet group successfully');
      queryClient.invalidateQueries({
        queryKey: QUERY_WALLET.walletGroups,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_WALLET.walletGroup(groupId),
      });
    },
  });

  if (walletGroupIsLoading) {
    return <ViewLoading />;
  }

  if (!walletGroup) {
    return (
      <ViewNotFound
        title="Wallet Group Not Found"
        onBack={() => navigate('/settings/manage-wallets')}
      />
    );
  }

  const handleRemoveGroup = async () => {
    await removeWalletGroupMutation.mutateAsync();
    setRemoveGroupOpen(false);
  };

  const { walletContainer } = walletGroup;
  const isSignerGroup = isSignerContainer(walletContainer);
  const isMnemonicGroup = isMnemonicContainer(walletContainer);
  const isHardwareGroup = isHardwareContainer(walletContainer);

  const isLastGroup = allGroups ? allGroups.length <= 1 : true;

  const needsBackupQuery = needsBackup(walletGroup);

  const items: ItemType[] = [
    {
      label: 'Add New Wallet',
      icon: LuPlus,
      iconRight: LuChevronRight,
      onClick: () =>
        navigate(`${ADD_WALLET_ROUTES.ROOT}?groupId=${walletGroup.id}`, {
          state: { direction: 'forward' },
        }),
    },
    isSignerGroup
      ? {
          label: 'Recovery Phrase',
          icon: LuKey,
          iconRight: LuChevronRight,
          subLabelElement: <BackupInfoNote group={walletGroup} />,
          onClick: () => {
            const params = new URLSearchParams({ groupId: walletGroup.id });
            if (needsBackupQuery) params.set('needsBackup', 'true');
            navigate(`${BACKUP_WALLET_ROUTES.ROOT}?${params.toString()}`, {
              state: { direction: 'forward' },
            });
          },
        }
      : null,
    {
      label: 'Remove Group',
      icon: LuTrash,
      variant: 'danger',
      disabled: isLastGroup,
      onClick: () => {
        if (isLastGroup) return;
        setRemoveGroupOpen(true);
      },
    },
  ].filter(Boolean) as ItemType[];

  return (
    <>
      <Layout
        title={getGroupDisplayName(walletGroup.name)}
        onBack={() =>
          navigate('/settings/manage-wallets', {
            state: { direction: 'back', openGroupId: walletGroup.id },
          })
        }
      >
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
      </Layout>

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
    </>
  );
}
