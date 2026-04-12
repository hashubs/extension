import { HiOutlineViewGrid } from 'react-icons/hi';
import { WalletSelector } from './wallet-selector';

interface Props {
  onMenuOpen?: () => void;
}

export function OverviewHeader({ onMenuOpen }: Props) {
  return (
    <div className="flex items-center justify-between border-b border-muted pb-2 mb-4">
      <WalletSelector />

      <button
        onClick={onMenuOpen}
        className="text-muted-foreground/80 hover:opacity-70 transition-opacity p-1 rounded-md"
      >
        <HiOutlineViewGrid size={20} />
      </button>
    </div>
  );
}
