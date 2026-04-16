import { useConnectionHeaderDrag } from '@/ui/hooks/useConnectionHeaderDrag';
import { useState } from 'react';
import {
  FiArrowDownLeft,
  FiArrowUpRight,
  FiRefreshCw,
  FiShoppingCart,
} from 'react-icons/fi';
import { LuHistory } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { OverviewHeader } from './header';
import { NetworkSelector } from './network-selector';

type ActionKey = 'send' | 'receive' | 'swap' | 'buy' | 'actions';

const ACTIONS: { key: ActionKey; label: string; icon: React.ReactNode }[] = [
  { key: 'send', label: 'Send', icon: <FiArrowUpRight size={18} /> },
  { key: 'receive', label: 'Receive', icon: <FiArrowDownLeft size={18} /> },
  { key: 'swap', label: 'Swap', icon: <FiRefreshCw size={18} /> },
  { key: 'buy', label: 'Buy', icon: <FiShoppingCart size={18} /> },
  { key: 'actions', label: 'History', icon: <LuHistory size={18} /> },
];

type DragHandlers = ReturnType<typeof useConnectionHeaderDrag>['dragHandlers'];

interface Props {
  accountName?: string;
  balance?: string;
  balanceChange?: string;
  onMenuOpen?: () => void;
  dragHandlers?: DragHandlers;
}

export function OverviewCard({
  balance = '$0.12',
  balanceChange = '+$35',
  onMenuOpen,
  dragHandlers,
}: Props) {
  const navigate = useNavigate();

  const [pressedAction, setPressedAction] = useState<ActionKey | null>(null);

  return (
    <div className="p-1.5" {...dragHandlers}>
      <div className="p-1.5 rounded-[24px] bg-[#f6f6f8] dark:bg-[#1f1f1f]">
        <div className="bg-white dark:bg-[#171717] p-[14px] rounded-[20px]">
          <OverviewHeader onMenuOpen={onMenuOpen} />

          <div className="mb-3">
            <p className="text-sm font-medium text-muted-foreground">
              Wallet (USD)
            </p>
            <div className="text-[40px] font-bold leading-tight">{balance}</div>
            <p className="text-sm font-medium text-muted-foreground">
              <span className="text-green-500">{balanceChange}</span> Since last
              month
            </p>
          </div>

          <NetworkSelector />
        </div>

        <div className="grid grid-cols-5 gap-1 px-1 pt-2.5 pb-1">
          {ACTIONS.map(({ key, label, icon }) => (
            <button
              key={key}
              onMouseDown={() => setPressedAction(key)}
              onMouseUp={() => setPressedAction(null)}
              onMouseLeave={() => setPressedAction(null)}
              onClick={() => navigate(`/${key}`)}
              className="flex flex-col items-center gap-1.5 bg-transparent border-none cursor-pointer p-1.5"
            >
              <div
                className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center transition-transform duration-100"
                style={{
                  transform: pressedAction === key ? 'scale(0.92)' : 'scale(1)',
                }}
              >
                <span className="text-white dark:text-black">{icon}</span>
              </div>
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
