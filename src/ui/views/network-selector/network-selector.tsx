import { Layout } from '@/ui/components/layout';
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
        const queryString = newParams.toString();
        let target = next;
        if (queryString) {
          const connector = next.includes('?')
            ? next.endsWith('?') || next.endsWith('&')
              ? ''
              : '&'
            : '?';
          target = `${next}${connector}${queryString}`;
        }

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

  const handleBack = useCallback(() => {
    const next = searchParams.get('next');
    if (next) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('next');
      newParams.delete('paramName');
      newParams.delete('showAll');

      const queryString = newParams.toString();
      let target = next;
      if (queryString) {
        const connector = next.includes('?')
          ? next.endsWith('?') || next.endsWith('&')
            ? ''
            : '&'
          : '?';
        target = `${next}${connector}${queryString}`;
      }

      navigate(target, {
        replace: true,
        state: { direction: 'back' },
      });
    } else {
      navigate('/overview', { state: { direction: 'back' } });
    }
  }, [navigate, searchParams]);

  return (
    <Layout title="Select Network" onBack={handleBack} wrapped={false}>
      <Input
        type="search"
        placeholder="Search networks..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        size="md"
        status="default"
        icon={IoSearchOutline}
      />

      <NetworkList
        activeNetworkId={localActiveId}
        onSelect={onSelect}
        searchQuery={searchQuery}
        showAll={showAll}
      />
    </Layout>
  );
}
