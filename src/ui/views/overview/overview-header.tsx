import { cn } from '@/ui/lib/utils';
import { GoGlobe } from 'react-icons/go';
import { useConnectionSite } from './connection-site/connection-site';
import { MenuDropdown } from './menu-dropdown';
import { WalletSelect } from './wallet-select';

interface Props {
  onConnectionSite?: () => void;
}

export function OverviewHeader({ onConnectionSite }: Props) {
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
        <MenuDropdown />
      </div>
    </div>
  );
}
