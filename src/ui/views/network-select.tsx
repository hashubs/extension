import { getAddressType } from '@/shared/wallet/classifiers';
import { setCurrentNetworkId } from '@/shared/request/internal/setCurrentNetworkId';
import { Header } from '@/ui/components/header';
import { NetworkList } from '@/ui/components/Network/NetworkList';
import { useAddressParams } from '@/ui/hooks/request/internal/useAddressParams';
import { useCurrentNetworkId } from '@/ui/hooks/request/internal/useCurrentNetworkId';
import { Input } from '@/ui/ui-kit';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function NetworkSelect() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { networkId: storedNetworkId } = useCurrentNetworkId();
  const { singleAddress: currentAddress } = useAddressParams();

  useEffect(() => {
    if (currentAddress && getAddressType(currentAddress) === 'solana') {
      navigate('/overview', { replace: true });
    }
  }, [currentAddress, navigate]);

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
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <Header title="Select Network" onBack={() => navigate(-1)} />

      <div className="px-4 pb-3 pt-0.5 border-b border-muted-foreground/10">
        <Input
          type="search"
          placeholder="Search networks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="md"
          status="default"
          leftIcon={IoSearchOutline}
        />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4">
        <NetworkList
          activeNetworkId={localActiveId}
          onSelect={onSelect}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}
