import { WalletGroup } from '@/background/wallet/model/types';
import { BlockchainType } from '@/shared/wallet/classifiers';
import { emojify } from '@/ui/components/wallet/WalletDisplayName/getWalletDisplayName';
import { cn } from '@/ui/lib/utils';
import React from 'react';
import { SiEthereum, SiSolana } from 'react-icons/si';

export const ChainIcon = ({
  chain,
  size = 10,
}: {
  chain: BlockchainType;
  size?: number;
}) =>
  chain === 'evm' ? (
    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#627eea]">
      <SiEthereum className="text-white" size={size} />
    </span>
  ) : (
    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#9945ff]">
      <SiSolana className="text-white" size={size} />
    </span>
  );

interface Props {
  group: WalletGroup;
  index: number;
  onClick?: () => void;
  subtitle?: React.ReactNode;
  rightElement?: React.ReactNode;
  className?: string;
  badge?: React.ReactNode;
}

export function WalletGroupItem({
  group,
  index,
  onClick,
  subtitle,
  rightElement,
  className,
  badge,
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'w-full flex items-center justify-between px-4 py-3 transition-colors',
        onClick && 'hover:bg-neutral-50 dark:hover:bg-white/5 active:scale-[0.98]',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-semibold text-neutral-600 dark:text-neutral-300">
          {index + 1}
        </span>
        <div className="flex flex-col items-start -translate-y-px">
          <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
            {emojify(group.name)}
          </span>
          {subtitle && (
            <div className="flex gap-1 mt-0.5">
              {subtitle}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {badge}
        {rightElement}
      </div>
    </button>
  );
}
