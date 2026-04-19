import { Header } from '@/ui/components/header';
import { Input } from '@/ui/ui-kit';
import { NetworkList } from '@/ui/views/network-selector/network-list';
import { useCallback, useEffect, useState } from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function NetworkSelectorView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const showAll = searchParams.get('showAll') !== 'false';
  const customParamName = searchParams.get('paramName') || 'network';

  const resolvedActiveId = searchParams.get(customParamName) || 'all';

  const [localActiveId, setLocalActiveId] = useState(resolvedActiveId);

  useEffect(() => {
    setLocalActiveId(resolvedActiveId);
  }, [resolvedActiveId]);


  const onSelect = useCallback(
    async (networkId: string, networkName: string) => {
      setLocalActiveId(networkId);

      const next = searchParams.get('next');
      const newParams = new URLSearchParams(searchParams);

      const customNameParam = `${customParamName}Name`;

      // Clean up internal params before appending to 'next'
      newParams.delete('next');
      newParams.delete('paramName');
      newParams.delete('showAll');

      if (networkId === 'all') {
        newParams.set(customParamName, 'all');
        newParams.set(customNameParam, 'All Networks');
      } else {
        newParams.set(customParamName, networkId);
        newParams.set(customNameParam, networkName);
      }

      setSearchParams(newParams, { replace: true });


      if (next) {
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
    [navigate, searchParams, setSearchParams, customParamName]
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Select Network"
        onBack={() => navigate('/overview', { state: { direction: 'back' } })}
      />

      <div className="flex flex-col flex-1 h-full min-h-0 px-4 space-y-4">
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
            showAll={showAll}
          />
        </div>
      </div>
    </div>
  );
}
