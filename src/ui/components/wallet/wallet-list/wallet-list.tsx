import { normalizeAddress } from '@/shared/normalize-address';
import { middot } from '@/shared/typography';
import { formatCurrencyToParts } from '@/shared/units/formatCurrencyValue';
import { getAddressType } from '@/shared/wallet/classifiers';
import { getWalletId } from '@/shared/wallet/wallet-list';
import { BlockieImg } from '@/ui/components/BlockieImg';
import { WalletDisplayName } from '@/ui/components/wallet';
import { useAddressActivity } from '@/ui/hooks/request/external/useAddressActivity';
import { WalletNameType } from '@/ui/hooks/request/internal/useProfileName';
import { NeutralDecimals } from '@/ui/ui-kit';
import { useMemo } from 'react';
import { FaCheck } from 'react-icons/fa';
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
      className="group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all bg-item border border-border/20 hover:bg-black/5 dark:hover:bg-white/5"
    >
      <div className="shrink-0 flex items-center justify-center">
        <BlockieImg address={wallet.address} size={30} borderRadius={4} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-[2px]">
          <span className="text-xs leading-none">
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
          <span className="inline-flex text-base font-medium leading-none">
            <NeutralDecimals
              parts={formatCurrencyToParts(wallet.valueUsd, 'en', 'USD')}
            />
          </span>
        </div>
        {isSelected && <FaCheck className="w-4 h-4 text-muted-foreground/80" />}
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

  const { data: activityData } = useAddressActivity({
    addresses: allAddresses,
    options: {
      enabled: allAddresses.length > 0,
      suspense: false,
      useErrorBoundary: false,
    },
  });

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
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.id} className="flex flex-col gap-2">
          <div className="text-[10px] font-bold uppercase tracking-widest pl-1">
            {group.title}
          </div>
          <div className="flex flex-col space-y-2">
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
    </div>
  );
}
