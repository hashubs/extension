import { setCurrentNetworkId } from '@/shared/request/internal/setCurrentNetworkId';
import { Header } from '@/ui/components/header';
import { useCurrentNetworkId } from '@/ui/hooks/request/internal/useCurrentNetworkId';
import { Input } from '@/ui/ui-kit';
import { NetworkList } from '@/ui/views/network-select/network-list';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function NetworkSelect() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { networkId: storedNetworkId } = useCurrentNetworkId();

  const [searchQuery, setSearchQuery] = useState('');

  const resolvedActiveId =
    searchParams.get('network') || storedNetworkId || 'all';

  const [localActiveId, setLocalActiveId] = useState(resolvedActiveId);

  useEffect(() => {
    setLocalActiveId(resolvedActiveId);
  }, [resolvedActiveId]);

  const { mutateAsync: updateNetwork } = useMutation({
    mutationFn: (networkId: string | null) =>
      setCurrentNetworkId({ networkId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['wallet/getCurrentNetworkId'],
      });
    },
  });

  const onSelect = useCallback(
    async (networkId: string) => {
      setLocalActiveId(networkId);

      const idToSave = networkId === 'all' ? null : networkId;
      const next = searchParams.get('next');
      const newParams = new URLSearchParams(searchParams);

      if (networkId === 'all') {
        newParams.delete('network');
      } else {
        newParams.set('network', networkId);
      }

      setSearchParams(newParams, { replace: true });

      await updateNetwork(idToSave).catch(console.error);

      if (next) {
        newParams.delete('next');
        const connector = next.includes('?') ? '&' : '?';
        const target = `${next}${
          newParams.toString() ? `${connector}${newParams.toString()}` : ''
        }`;

        navigate(target, {
          replace: true,
          state: { direction: 'back' },
        });
      } else {
        navigate(-1);
      }
    },
    [navigate, searchParams, setSearchParams, updateNetwork]
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Select Network" onBack={() => navigate(-1)} />

      <div className="flex flex-col flex-1 min-h-0 px-4 space-y-4">
        <Input
          type="search"
          placeholder="Search networks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="md"
          status="default"
          leftIcon={IoSearchOutline}
        />

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <NetworkList
            activeNetworkId={localActiveId}
            onSelect={onSelect}
            searchQuery={searchQuery}
          />
        </div>
      </div>
    </div>
  );
}
