'use client';

import { AddEthereumChainParameter } from '@/modules/ethereum/types/add-ethereum-chain-parameter';
import { noValueDash } from '@/shared/typography';
import { cn } from '@/ui/lib/utils';
import { Button } from '@/ui/ui-kit';
import { useEffect, useState } from 'react';
import { HiCheckCircle } from 'react-icons/hi2';
import { RiArrowDownLine, RiExternalLinkLine } from 'react-icons/ri';
import { SiEthereum } from 'react-icons/si';
import { TbHash, TbPlugConnected, TbWorldWww } from 'react-icons/tb';

type Accent = 'blue' | 'emerald';

type InfoCellProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  copyable?: boolean;
  full?: boolean;
  accent?: Accent;
};

function truncate(url: string, max = 30) {
  return url.length > max ? url.slice(0, max) + '…' : url;
}

function CheckBadge({ accent }: { accent: Accent }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={cn(
        'w-14 h-14 rounded-full border-2 flex items-center justify-center',
        'transition-all duration-700 ease-out',
        accent === 'blue' && 'border-blue-500/50',
        accent === 'emerald' && 'border-emerald-500/50',
        visible
          ? 'opacity-100 scale-100 rotate-0'
          : 'opacity-0 scale-50 -rotate-90'
      )}
    >
      <HiCheckCircle
        className={cn(
          'w-7 h-7',
          accent === 'blue' && 'text-blue-400',
          accent === 'emerald' && 'text-emerald-400'
        )}
      />
    </div>
  );
}

function InfoCell({ icon, label, value, full = false, accent }: InfoCellProps) {
  return (
    <div
      className={cn(
        'rounded-xl px-3.5 py-3 flex flex-col gap-1.5 border',
        full && 'col-span-2',
        accent === 'blue' && 'bg-blue-500/7 border-blue-500/20',
        accent === 'emerald' && 'bg-emerald-500/7 border-emerald-500/20',
        !accent && 'bg-white/4 border-white/6'
      )}
    >
      <div className="flex items-center gap-1.5 text-zinc-500">
        <span className="text-[11px] leading-none">{icon}</span>
        <span className="text-[10px] uppercase tracking-widest font-medium leading-none">
          {label}
        </span>
      </div>
      <div className="flex items-center justify-between gap-1">
        <span
          className={cn(
            'font-mono text-[11.5px] break-all leading-relaxed',
            accent === 'blue' && 'text-blue-300',
            accent === 'emerald' && 'text-emerald-300',
            !accent && 'text-zinc-200'
          )}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

export function NetworkUpdateSuccess({
  chainConfig,
  prevChainConfig,
  onClose,
}: {
  chainConfig: AddEthereumChainParameter;
  prevChainConfig: AddEthereumChainParameter;
  onClose: () => void;
}) {
  const prevRpcUrl = prevChainConfig.rpcUrls[0];
  const rpcUrl = chainConfig.rpcUrls[0];
  const networkName = chainConfig.chainName || chainConfig.chainId;

  return (
    <div className="flex flex-col items-center h-full p-4 pt-6 gap-4">
      <CheckBadge accent="blue" />

      <div className="text-center">
        <h2 className="text-[22px] font-bold tracking-tight leading-tight">
          {networkName}
        </h2>
        <p className="text-[10px] tracking-widest uppercase text-muted-foreground mt-1">
          RPC endpoint updated
        </p>
      </div>

      <div className="w-full h-px bg-white/6" />

      <div className="w-full flex flex-col gap-3">
        <InfoCell
          icon={<TbWorldWww />}
          label="Previous RPC"
          value={truncate(prevRpcUrl)}
          copyable
        />

        <div className="flex items-center gap-2 px-1">
          <div className="flex-1 h-px bg-white/6" />
          <div className="w-6 h-6 rounded-full border border-white/10 bg-white/4 flex items-center justify-center">
            <RiArrowDownLine size={11} className="text-zinc-500" />
          </div>
          <div className="flex-1 h-px bg-white/6" />
        </div>

        <InfoCell
          icon={<TbWorldWww />}
          label="Active RPC"
          value={truncate(rpcUrl)}
          copyable
          accent="blue"
        />
      </div>
      <Button
        variant="primary"
        size="md"
        className="w-full mt-auto"
        onClick={onClose}
      >
        Close
      </Button>
    </div>
  );
}

export function NetworkCreateSuccess({
  chainConfig,
  onClose,
}: {
  chainConfig: AddEthereumChainParameter;
  paddingTop?: number;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center h-full p-4 pt-6 gap-4">
      <CheckBadge accent="emerald" />

      <div className="text-center">
        <h2 className="text-[22px] font-bold tracking-tight leading-tight">
          {chainConfig.chainName || chainConfig.chainId}
        </h2>
        <p className="text-[10px] tracking-widest uppercase text-muted-foreground mt-1">
          Network added
        </p>
      </div>

      <div className="w-full h-px bg-white/6" />

      <div className="w-full grid grid-cols-2 gap-2">
        <InfoCell
          icon={<TbWorldWww />}
          label="RPC URL"
          value={truncate(chainConfig.rpcUrls[0] || noValueDash)}
          copyable
          full
        />
        <InfoCell
          icon={<TbHash />}
          label="Chain ID"
          value={chainConfig.chainId}
          copyable
        />
        <InfoCell
          icon={<SiEthereum />}
          label="Symbol"
          value={chainConfig.nativeCurrency.symbol ?? noValueDash}
        />

        <div className="col-span-2 bg-white/4 border border-white/6 rounded-xl px-3.5 py-3 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <TbPlugConnected size={11} />
            <span className="text-[10px] uppercase tracking-widest font-medium leading-none">
              Explorer
            </span>
          </div>
          <a
            href={chainConfig.blockExplorerUrls?.[0] || noValueDash}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 font-mono text-[11.5px] text-emerald-400 hover:text-emerald-300 transition-colors break-all leading-relaxed"
          >
            {truncate(chainConfig.blockExplorerUrls?.[0] || noValueDash)}
            <RiExternalLinkLine size={11} className="shrink-0 mt-0.5" />
          </a>
        </div>
      </div>
      <Button
        variant="primary"
        size="md"
        className="w-full mt-auto"
        onClick={onClose}
      >
        Close
      </Button>
    </div>
  );
}
