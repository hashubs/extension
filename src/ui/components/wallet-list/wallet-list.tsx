import { truncateAddress } from '@/ui/lib/utils';
import { useMemo } from 'react';
import { normalizeAddress } from 'src/shared/normalize-address';
import { getWalletId } from 'src/shared/wallet/wallet-list';
import { WalletDisplayName } from 'src/ui/components/WalletDisplayName';
import { BlockieImg } from '../BlockieImg';
import { AnyWallet, getFullWalletList, WalletGroupInfo } from './shared';

function WalletListItem({
  wallet,
  isSelected,
  onClick,
}: {
  wallet: AnyWallet;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      role="button"
      onClick={onClick}
      className={`group relative flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500/50 bg-blue-500/10 shadow-sm'
          : 'hover:bg-black/5 dark:hover:bg-white/5'
      }`}
    >
      <div className="shrink-0 flex items-center justify-center">
        <BlockieImg address={wallet.address} size={28} borderRadius={4} />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium leading-tight">
          <WalletDisplayName wallet={wallet} />
        </span>
        <span className="text-[11px] font-mono text-muted-foreground/80">
          {truncateAddress(wallet.address)}
        </span>
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
  const groups = useMemo(
    () =>
      getFullWalletList({
        walletGroups,
        predicate,
      }),
    [walletGroups, predicate]
  );

  const walletMap = useMemo(() => {
    const map = new Map<
      string,
      { group: WalletGroupInfo; wallet: AnyWallet }
    >();
    for (const group of walletGroups) {
      for (const wallet of group.walletContainer.wallets) {
        map.set(
          getWalletId({
            address: wallet.address,
            groupId: group.id,
          }),
          { group, wallet }
        );
      }
    }
    return map;
  }, [walletGroups]);

  if (groups.length === 0) {
    return (
      <div className="text-sm font-medium text-center py-10 rounded-2xl border-2 border-dashed border-muted-foreground/10">
        No wallets found
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.id} className="flex flex-col gap-2">
          <div className="text-[10px] font-bold uppercase tracking-widest pl-1">
            {group.title}
          </div>
          <div className="flex flex-col gap-1.5">
            {group.walletIds.map((walletId) => {
              const { group: walletGroup, wallet } =
                walletMap.get(walletId) || {};
              if (!wallet || !walletGroup) return null;

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
    </div>
  );
}
