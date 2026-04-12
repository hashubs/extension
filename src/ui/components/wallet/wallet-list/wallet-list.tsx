import { normalizeAddress } from '@/shared/normalize-address';
import { middot } from '@/shared/typography';
import { formatCurrencyToParts } from '@/shared/units/formatCurrencyValue';
import { getAddressType } from '@/shared/wallet/classifiers';
import { getWalletId } from '@/shared/wallet/wallet-list';
import { BlockieAddress } from '@/ui/components/blockie';
import { WalletDisplayName } from '@/ui/components/wallet';
import { usePortfolioValues } from '@/ui/hooks/request/external/usePortfolioValues';
import { WalletNameType } from '@/ui/hooks/request/internal/useProfileName';
import { cn } from '@/ui/lib/utils';
import { NeutralDecimals } from '@/ui/ui-kit';
import { useMemo } from 'react';
import { IoCheckmark } from 'react-icons/io5';
import { AnyWallet, getFullWalletList, WalletGroupInfo } from './shared';

type AnyWalletWithValue = AnyWallet & {
  valueUsd: number;
};

function getWalletKey(address: string) {
  return getAddressType(address) === 'evm' ? address.toLowerCase() : address;
}

function WalletListItem({
  wallet,
  isSelected,
  onClick,
}: {
  wallet: AnyWalletWithValue;
  isSelected: boolean;
  onClick: () => void;
}) {
  const ecosystemPrefix =
    getAddressType(wallet.address) === 'evm' ? 'ETH' : 'SOL';

  return (
    <div
      role="button"
      onClick={onClick}
      className={cn(
        'group relative flex items-center justify-between w-full p-2.5 transition-all cursor-pointer',
        isSelected
          ? 'bg-black/5 dark:bg-white/5 rounded-lg'
          : 'hover:bg-black/5 dark:hover:bg-white/5 hover:rounded-lg'
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="shrink-0">
          <BlockieAddress address={wallet.address} size={32} borderRadius={6} />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-medium leading-tight text-foreground/90 group-hover:text-foreground">
            <WalletDisplayName
              wallet={wallet}
              render={(data) => (
                <>
                  {data.type !== WalletNameType.domain
                    ? `${ecosystemPrefix} ${middot} `
                    : ''}
                  {data.value}
                </>
              )}
            />
          </span>
          <span className="text-xs text-muted-foreground truncate">
            <NeutralDecimals
              parts={formatCurrencyToParts(wallet.valueUsd, 'en', 'USD')}
            />
          </span>
        </div>
      </div>

      <div className="flex items-center shrink-0">
        {isSelected && <IoCheckmark className="w-5 h-5 text-green-500" />}
      </div>
    </div>
  );
}

const alwaysTrue = () => true;

export function WalletList({
  walletGroups,
  selectedAddress,
  onSelect,
  predicate = alwaysTrue,
}: {
  walletGroups: WalletGroupInfo[];
  selectedAddress: string;
  onSelect(wallet: AnyWallet, groupId: string): void;
  predicate?: (item: AnyWallet) => boolean;
}) {
  const groups = useMemo(() => {
    if (!walletGroups) return [];
    return getFullWalletList({
      walletGroups,
      predicate,
    });
  }, [walletGroups, predicate]);

  const walletMap = useMemo(() => {
    const map = new Map<
      string,
      { group: WalletGroupInfo; wallet: AnyWallet }
    >();
    if (!walletGroups) return map;

    for (const group of walletGroups) {
      for (const wallet of group.walletContainer.wallets) {
        map.set(getWalletId({ address: wallet.address, groupId: group.id }), {
          group,
          wallet,
        });
      }
    }
    return map;
  }, [walletGroups]);

  const allAddresses = useMemo(
    () =>
      groups.flatMap(
            (group) =>
          group.walletIds
            .map((walletId) => walletMap.get(walletId)?.wallet.address)
            .filter(Boolean) as string[]
      ),
    [groups, walletMap]
  );

  const { data: activityData } = usePortfolioValues(allAddresses);

  const walletsWithActivity = useMemo(() => {
    const map = new Map<
      string,
      { group: WalletGroupInfo; wallet: AnyWalletWithValue }
    >();
    for (const [walletId, { group, wallet }] of walletMap.entries()) {
      const totalValue =
        activityData?.[getWalletKey(wallet.address)]?.totalValue;
      map.set(walletId, {
        group,
        wallet: {
          ...wallet,
          valueUsd: totalValue ?? 0,
        },
      });
    }
    return map;
  }, [walletMap, activityData]);

  return (
    <div className="flex flex-col gap-6 pb-6 overflow-y-auto no-scrollbar">
      {groups.map((group) => (
        <div key={group.id} className="flex flex-col gap-1">
          {group.title && (
            <div className="text-[10px] font-bold uppercase tracking-widest pl-2.5 pb-1 text-muted-foreground/70">
              {group.title}
            </div>
          )}
          <div className="flex flex-col">
            {group.walletIds.map((walletId) => {
              const entry = walletsWithActivity.get(walletId);
              if (!entry) return null;

              const { group: walletGroup, wallet } = entry;

              const isSelected =
                walletId === selectedAddress ||
                (normalizeAddress(wallet.address) ===
                  normalizeAddress(selectedAddress) &&
                  !selectedAddress.includes(':'));

              return (
                <WalletListItem
                  key={walletId}
                  wallet={wallet}
                  isSelected={isSelected}
                  onClick={() => onSelect(wallet, walletGroup.id)}
                />
              );
            })}
          </div>
        </div>
      ))}

      {groups.length === 0 && (
        <div className="p-8 text-center text-muted-foreground italic">
          No wallets found
        </div>
      )}
    </div>
  );
}
