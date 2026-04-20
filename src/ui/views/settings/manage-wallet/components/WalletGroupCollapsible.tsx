import { WalletGroup } from '@/background/wallet/model/types';
import { isHardwareContainer } from '@/shared/types/validators';
import { BLOCKCHAIN_TYPES, BlockchainType } from '@/shared/wallet/classifiers';
import { BackupInfoNote, needsBackup } from '@/ui/components/BackupInfoNote';
import { getGroupDisplayName } from '@/ui/components/wallet/WalletDisplayName/getGroupDisplayName';
import { cn, truncateAddress } from '@/ui/lib/utils';
import { Card, Collapsible, CollapsibleContent } from '@/ui/ui-kit';
import React, { useMemo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiCopy } from 'react-icons/fi';
import { SiEthereum, SiSolana } from 'react-icons/si';
import { groupByEcosystem } from '../_shared/groupByEcosystem';

const chainLabel = (id: BlockchainType) =>
  id === 'evm' ? 'Ethereum' : 'Solana';

const ChainIcon = ({
  chain,
  size = 10,
}: {
  chain: BlockchainType;
  size?: number;
}) =>
  chain === 'evm' ? (
    <span className="flex items-center justify-center w-5 h-5 rounded-sm bg-[#627eea]">
      <SiEthereum className="text-white" size={size} />
    </span>
  ) : (
    <span className="flex items-center justify-center w-5 h-5 rounded-sm bg-[#9945ff]">
      <SiSolana className="text-white" size={size} />
    </span>
  );

function BlockchainAddresses({
  chain,
  wallets,
}: {
  chain: BlockchainType;
  wallets: WalletGroup['walletContainer']['wallets'];
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (addr: string) => {
    navigator.clipboard.writeText(addr).catch(() => {});
    setCopied(addr);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="bg-black/2 dark:bg-white/2 rounded-xl px-3 py-2.5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ChainIcon chain={chain} size={12} />
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
            {chainLabel(chain)}
          </span>
        </div>
        <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
          {wallets.length} wallet{wallets.length > 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {wallets.slice(0, 4).map((w) => (
          <button
            key={w.address}
            onClick={() => handleCopy(w.address)}
            className="flex items-center gap-1 bg-white/50 dark:bg-black/20 text-muted-foreground font-mono px-2 py-0.5 rounded-md hover:bg-white/80 dark:hover:bg-black/40 transition-colors"
          >
            <span className="pt-[3px]">
              {copied === w.address ? 'Copied!' : truncateAddress(w.address)}
            </span>
            <FiCopy size={10} />
          </button>
        ))}
      </div>
    </div>
  );
}

interface WalletGroupCollapsibleProps {
  group: WalletGroup;
  index: number;
  footer?: React.ReactNode;
  defaultOpen?: boolean;
  hiddenBackup?: boolean;
}

export function WalletGroupCollapsible({
  group,
  index,
  footer,
  defaultOpen = false,
  hiddenBackup = false,
}: WalletGroupCollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);

  const byEcosystem = useMemo(
    () => groupByEcosystem(group.walletContainer.wallets),
    [group.walletContainer.wallets]
  );

  const container = group.walletContainer;
  const hardwareContainer = isHardwareContainer(container) ? container : null;

  return (
    <Card>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-semibold',
              needsBackup(group)
                ? hiddenBackup
                  ? 'text-neutral-600 dark:text-neutral-300'
                  : 'border text-amber-600 border-amber-600/50'
                : 'text-neutral-600 dark:text-neutral-300'
            )}
          >
            {index + 1}
          </span>
          <div className="flex flex-col items-start -translate-y-px">
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
              {getGroupDisplayName(group.name)}
            </span>
            {hardwareContainer && (
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                {hardwareContainer.provider}
                {hardwareContainer.device?.productName
                  ? ` · ${hardwareContainer.device.productName}`
                  : ''}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {open ? (
            <FiChevronUp size={14} className="text-neutral-400" />
          ) : (
            <FiChevronDown size={14} className="text-neutral-400" />
          )}
        </div>
      </button>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-3 flex flex-col gap-2">
            {BLOCKCHAIN_TYPES.map((chain) => {
              const wallets = (byEcosystem as any)[chain];
              if (!wallets || wallets.length === 0) return null;
              return (
                <BlockchainAddresses
                  key={chain}
                  chain={chain}
                  wallets={wallets}
                />
              );
            })}
            <div className="flex items-center justify-between mt-1">
              {!hiddenBackup && <BackupInfoNote group={group} />}
              {footer}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
