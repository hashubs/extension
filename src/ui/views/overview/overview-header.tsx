import { cn } from '@/ui/lib/utils';
import { GoGlobe } from 'react-icons/go';
import { HiOutlineViewGrid } from 'react-icons/hi';
import { useConnectionSite } from './connection-site/connection-site';
import { WalletSelect } from './wallet-select';

interface Props {
  onMenuOpen?: () => void;
  onConnectionSite?: () => void;
}

export function OverviewHeader({ onMenuOpen, onConnectionSite }: Props) {
  const { isRevealable, isConnectedToActiveTab } = useConnectionSite();
  return (
    <div className="flex items-center justify-between border-b border-muted pb-2 mb-4">
      <WalletSelect />

      <div className="flex items-center gap-0.5">
        {isRevealable && (
          <button
            onClick={onConnectionSite}
            className={cn(
              'hover:opacity-70 transition-opacity p-1 rounded-md',
              isConnectedToActiveTab ? 'text-teal-500' : ''
            )}
          >
            <GoGlobe size={20} />
          </button>
        )}
        <button
          onClick={onMenuOpen}
          className="hover:opacity-70 transition-opacity p-1 rounded-md"
        >
          <HiOutlineViewGrid size={20} />
        </button>
      </div>
    </div>
  );
}
