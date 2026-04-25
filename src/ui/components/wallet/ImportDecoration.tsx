import { BlockieAddress } from '@/ui/components/blockie';
import { ViewLoading } from '@/ui/components/view-loading';
import { cn, truncateAddress } from '@/ui/lib/utils';
import { animated, useSpring } from '@react-spring/web';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { SiEthereum, SiSolana } from 'react-icons/si';

interface Props {
  wallets: any[];
  isLoading: boolean;
  loadingTitle: string;
}

function WalletItem({ wallet }: { wallet: any }) {
  const isEvm = wallet.address.startsWith('0x');
  const Icon = isEvm ? SiEthereum : SiSolana;
  const color = isEvm ? 'bg-[#627eea]' : 'bg-[#9945ff]';

  return (
    <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-xl border border-neutral-100 dark:border-white/5 shadow-sm w-full">
      <div className="shrink-0 relative">
        <BlockieAddress address={wallet.address} size={32} borderRadius={8} />
        <div
          className={cn(
            'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-neutral-900 flex items-center justify-center text-white',
            color
          )}
        >
          <Icon size={8} />
        </div>
      </div>
      <div className="flex flex-col items-start min-w-0">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">
          {isEvm ? 'Ethereum' : 'Solana'}
        </span>
        <span className="text-sm font-mono font-medium text-neutral-800 dark:text-neutral-100 truncate w-full">
          {truncateAddress(wallet.address)}
        </span>
      </div>
    </div>
  );
}

export function ImportDecoration({ wallets, isLoading, loadingTitle }: Props) {
  const style = useSpring({
    opacity: isLoading ? 0 : 1,
    transform: isLoading ? 'scale(0.8)' : 'scale(1)',
    config: { tension: 200, friction: 20 },
  });

  useEffect(() => {
    if (!isLoading && wallets.length > 0) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#84cc16', '#65a30d', '#bef264', '#ffffff'],
      });
    }
  }, [isLoading, wallets.length]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      {isLoading ? (
        <ViewLoading loadingText={loadingTitle} />
      ) : (
        <animated.div style={{ ...style, width: '100%', maxWidth: '325px' }}>
          <div className="bg-item p-4 rounded-3xl border border-muted-foreground/20 shadow-2xl flex flex-col items-center gap-2">
            <h3 className="text-lg text-center">
              Your {wallets.length > 1 ? 'wallets' : 'wallet'} are ready
            </h3>
            <div className="flex flex-col gap-2 w-full max-h-[220px] overflow-y-auto no-scrollbar py-0.5">
              {wallets.map((w, i) => (
                <WalletItem key={w.address || i} wallet={w} />
              ))}
            </div>
          </div>
        </animated.div>
      )}
    </div>
  );
}
