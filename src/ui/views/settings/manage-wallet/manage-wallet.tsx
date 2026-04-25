import type { WalletGroup } from '@/background/wallet/model/types';
import { ContainerType, getContainerType } from '@/shared/types/validators';
import { BlockieAddress } from '@/ui/components/blockie';
import { Layout } from '@/ui/components/layout';
import { ViewLoading } from '@/ui/components/view-loading';
import {
  WalletDisplayName,
  WalletGroupCollapsible,
} from '@/ui/components/wallet';
import {
  usePrefetchWalletGroupDetails,
  useWalletGroups,
} from '@/ui/hooks/request/internal/useWallet';
import { Card, CardItem } from '@/ui/ui-kit';
import { ItemType } from '@/ui/ui-kit/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/ui/ui-kit/collapsible';
import { IMPORT_ROUTES } from '@/ui/views/import-wallet/constants';
import groupBy from 'lodash/groupBy';
import { useMemo, useState } from 'react';
import { IoAddOutline } from 'react-icons/io5';
import { LuChevronRight } from 'react-icons/lu';
import { useLocation, useNavigate } from 'react-router-dom';
import { CREATE_WALLET_ROUTES } from '../../create-wallet';

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
      <BlockieAddress address={wallet.address} size={28} borderRadius={4} />
    ),
    label: <WalletDisplayName wallet={wallet} />,
    onClick: () =>
      navigate(
        `/settings/manage-wallets/accounts/${wallet.address}?groupId=${wallet.groupId}`
      ),
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
        navigate(CREATE_WALLET_ROUTES.ROOT, {
          state: { direction: 'forward' },
        });
      },
      iconClassName: 'text-lime-500 bg-lime-500/10',
      iconRight: LuChevronRight,
    },
    {
      icon: IoAddOutline,
      label: 'Import Wallet',
      onClick: () =>
        navigate(IMPORT_ROUTES.ROOT, { state: { direction: 'forward' } }),
      iconClassName: 'text-lime-500 bg-lime-500/10',
      iconRight: LuChevronRight,
    },
  ];

  return (
    <Card title="Add Wallets">
      {items.map((item, i) => (
        <CardItem key={i} item={item} />
      ))}
    </Card>
  );
}

export function ManageWalletView() {
  const navigate = useNavigate();
  const location = useLocation();
  const openGroupId = location.state?.openGroupId as string | undefined;

  const [isMnemonicExpanded, setIsMnemonicExpanded] = useState(false);

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
    return <ViewLoading />;
  }

  return (
    <Layout
      title="Manage accounts"
      onBack={() => navigate('/settings', { state: { direction: 'back' } })}
    >
      {groupedBySeedType?.map(([type, items]) => {
        if (
          type === ContainerType.mnemonic ||
          type === ContainerType.hardware
        ) {
          const isMnemonic = type === ContainerType.mnemonic;
          const threshold = 2;
          const hasMore = isMnemonic && items.length > threshold;

          const initialItems = hasMore ? items.slice(0, threshold) : items;
          const extraItems = hasMore ? items.slice(threshold) : [];

          return (
            <div key={type} className="space-y-2">
              <Collapsible
                open={isMnemonicExpanded}
                onOpenChange={setIsMnemonicExpanded}
              >
                <div className="flex items-center justify-between px-1 mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
                    {isMnemonic ? 'Wallets' : 'Hardware Wallets'}
                  </h3>
                  {hasMore && (
                    <CollapsibleTrigger className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-tight">
                      {isMnemonicExpanded
                        ? 'Show Less'
                        : `Show ${extraItems.length} More`}
                    </CollapsibleTrigger>
                  )}
                </div>

                <div className="space-y-2">
                  {initialItems.map((group, i) => (
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

                {hasMore && (
                  <CollapsibleContent>
                    <div className="space-y-2 mt-2">
                      {extraItems.map((group, i) => (
                        <WalletGroupCollapsible
                          key={group.id}
                          group={group}
                          index={i + threshold}
                          defaultOpen={openGroupId === group.id}
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
                  </CollapsibleContent>
                )}
              </Collapsible>
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
          return <FlatWalletList key={type} groups={items} title="Watchlist" />;
        }
        return null;
      })}

      <AddWalletOptions />
    </Layout>
  );
}
