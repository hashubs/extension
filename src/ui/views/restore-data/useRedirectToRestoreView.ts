import { walletPort } from '@/shared/channel';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useRedirectToRestoreView() {
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ['restoreDataNeeded'],
    queryFn: () => walletPort.request('checkBackupData'),
  });

  useEffect(() => {
    if (data) {
      navigate('/restore-data', { replace: true });
    }
  }, [data, navigate]);
}
