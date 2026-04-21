import type { WalletGroup } from '@/background/wallet/model/types';
import { ContainerType, getContainerType } from '@/shared/types/validators';
import { BlockieAddress } from '@/ui/components/Blockie';
import { Header } from '@/ui/components/header';
import { ViewLoading } from '@/ui/components/view-loading';
import { getWalletDisplayName } from '@/ui/components/wallet/WalletDisplayName/getWalletDisplayName';
import {
  usePrefetchWalletGroupDetails,
  useWalletGroups,
} from '@/ui/hooks/request/internal/useWalletGroups';
import { Button, Card, CardItem } from '@/ui/ui-kit';
import { ItemType } from '@/ui/ui-kit/card';
import groupBy from 'lodash/groupBy';
import { useMemo } from 'react';
import { IoAddOutline } from 'react-icons/io5';
import { LuChevronRight } from 'react-icons/lu';
import { useLocation, useNavigate } from 'react-router-dom';
import { WalletGroupCollapsible } from './components/WalletGroupCollapsible';

function FlatWalletList({
  groups,
  title,
}: {
  groups: WalletGroup[];
  title: string;
}) {
  const navigate = useNavigate();
  const wallets = useMemo(
    () =>
      groups.flatMap((g) =>
        g.walletContainer.wallets.map((w) => ({ ...w, groupId: g.id }))
      ),
    [groups]
  );

  if (wallets.length === 0) return null;

  const items: ItemType[] = wallets.map((wallet) => ({
    iconNode: (
      <BlockieAddress address={wallet.address} size={18} borderRadius={4} />
    ),
    label: getWalletDisplayName(wallet),
    onClick: () =>
      navigate(
        `/settings/manage-wallets/accounts/${wallet.address}?groupId=${wallet.groupId}`
      ),
    iconClassName: 'text-lime-500 bg-lime-500/10',
    iconRight: LuChevronRight,
  }));

  return (
    <Card title={title}>
      {items.map((item, j) => (
        <CardItem key={j} item={item} />
      ))}
    </Card>
  );
}

function AddWalletOptions() {
  const navigate = useNavigate();

  const items: ItemType[] = [
    {
      icon: IoAddOutline,
      label: 'Create New Wallet',
      onClick: () => {
        navigate('add');
      },
      iconClassName: 'text-lime-500 bg-lime-500/10',
      iconRight: LuChevronRight,
    },
    {
      icon: IoAddOutline,
      label: 'Import Wallet',
      onClick: () => navigate('add/import'),
      iconClassName: 'text-lime-500 bg-lime-500/10',
      iconRight: LuChevronRight,
    },
    {
      icon: IoAddOutline,
      label: 'Connect Hardware Wallet',
      onClick: () => navigate('add/hardware'),
      iconClassName: 'text-lime-500 bg-lime-500/10',
      iconRight: LuChevronRight,
    },
    {
      icon: IoAddOutline,
      label: 'Watch Address',
      onClick: () => navigate('add/watch'),
      iconClassName: 'text-lime-500 bg-lime-500/10',
      iconRight: LuChevronRight,
    },
  ];

  return (
    <div className="flex flex-col space-y-4">
      <Card>
        {items.map((item, i) => (
          <CardItem key={i} item={item} />
        ))}
      </Card>

      <Button variant="danger" size="md">
        Erase All Data
      </Button>
    </div>
  );
}

export function ManageWalletView() {
  const navigate = useNavigate();
  const location = useLocation();
  const openGroupId = location.state?.openGroupId as string | undefined;

  const { data: walletGroups, isLoading } = useWalletGroups();

  usePrefetchWalletGroupDetails(walletGroups);

  const groupedBySeedType = useMemo(() => {
    if (!walletGroups) return null;

    const grouped = groupBy(walletGroups, (group) =>
      getContainerType(group.walletContainer)
    );

    return [
      ContainerType.mnemonic,
      ContainerType.privateKey,
      ContainerType.hardware,
      ContainerType.readonly,
    ]
      .filter((type) => grouped[type])
      .map((type) => [type, grouped[type]]) as Array<
      [ContainerType, WalletGroup[]]
    >;
  }, [walletGroups]);

  if (isLoading) {
    return (
      <ViewLoading
        onBack={() => navigate('/settings', { state: { direction: 'back' } })}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Manage accounts"
        onBack={() => navigate('/settings', { state: { direction: 'back' } })}
      />

      <div className="flex-1 p-4 pt-0 space-y-4 no-scrollbar overflow-y-auto">
        {groupedBySeedType?.map(([type, items]) => {
          if (
            type === ContainerType.mnemonic ||
            type === ContainerType.hardware
          ) {
            return (
              <div key={type} className="space-y-2">
                <h3 className="px-1 text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
                  {type === ContainerType.mnemonic
                    ? 'Wallets'
                    : 'Hardware Wallets'}
                </h3>
                {items.map((group, i) => (
                  <WalletGroupCollapsible
                    key={group.id}
                    group={group}
                    index={i}
                    defaultOpen={
                      openGroupId ? openGroupId === group.id : i === 0
                    }
                    footer={
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/settings/manage-wallets/groups/${group.id}`
                          );
                        }}
                        className="text-primary text-[11px] font-medium hover:text-primary/80"
                      >
                        View All
                      </button>
                    }
                  />
                ))}
              </div>
            );
          }
          if (type === ContainerType.privateKey) {
            return (
              <FlatWalletList
                key={type}
                groups={items}
                title="Imported by Private Key"
              />
            );
          }
          if (type === ContainerType.readonly) {
            return (
              <FlatWalletList key={type} groups={items} title="Watchlist" />
            );
          }
          return null;
        })}

        <AddWalletOptions />
      </div>
    </div>
  );
}
