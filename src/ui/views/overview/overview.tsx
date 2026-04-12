import { usePrefetchWalletGroups } from '@/ui/hooks/useWalletGroups';
import { OverviewCard } from './overview-card';

export function Overview() {
  usePrefetchWalletGroups();

  return (
    <div className="w-full h-full overflow-y-auto no-scrollbar">
      <OverviewCard />
    </div>
  );
}
