import { usePrefetchCurrentNetworkId } from '@/ui/hooks/request/internal/useCurrentNetworkId';
import { usePrefetchWalletGroups } from '@/ui/hooks/request/internal/useWalletGroups';
import { Button } from '@/ui/ui-kit';
import { useNavigate } from 'react-router-dom';
import { OverviewCard } from './overview-card';

export function Overview() {
  const navigate = useNavigate();

  usePrefetchWalletGroups();
  usePrefetchCurrentNetworkId();

  return (
    <div className="w-full h-full overflow-y-auto no-scrollbar">
      <OverviewCard />
      <Button onClick={() => navigate('/test-view')}>Test View</Button>
    </div>
  );
}
