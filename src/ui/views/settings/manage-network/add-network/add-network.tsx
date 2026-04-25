import { INTERNAL_ORIGIN } from '@/background/constants';
import { toCustomNetworkId } from '@/modules/ethereum/chains/helpers';
import { type AddEthereumChainParameter } from '@/modules/ethereum/types/add-ethereum-chain-parameter';
import { Networks as NetworksModule } from '@/modules/networks/networks';
import { walletPort } from '@/shared/channel';
import { collectData, type Parsers } from '@/shared/form-data';
import { normalizeChainId } from '@/shared/normalize-chain-id';
import { FormField } from '@/ui/components/form';
import { Layout } from '@/ui/components/layout';
import { usePreferences } from '@/ui/features/preferences';
import { useNetworks } from '@/ui/hooks/request/internal/useNetworks';
import { Button, Card, CardItem, Input } from '@/ui/ui-kit';
import { Switch } from '@/ui/ui-kit/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/ui-kit/tabs';
import { useMutation } from '@tanstack/react-query';
import { isTruthy } from 'is-truthy-ts';
import { useMemo, useState } from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { updateNetworks } from '../_shared/updateNetworks';
import { SearchResults } from './search-results';

const parsers: Parsers<any> = {
  chainId: (val: unknown) => normalizeChainId(val as string),
  'nativeCurrency.decimals': (val: unknown) => Number(val),
};

const BACK_ROUTE = '/settings/manage-networks';

export function AddNetwork() {
  const navigate = useNavigate();
  const { preferences } = usePreferences();
  const { networks } = useNetworks();
  const isTestnetMode = Boolean(preferences?.testnetMode?.on);

  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isVisible, setIsVisible] = useState(true);
  const [isTestnet, setIsTestnet] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async (params: {
      chain: string;
      chainConfig: AddEthereumChainParameter;
    }) => {
      const result = await walletPort.request('addEthereumChain', {
        values: [params.chainConfig],
        origin: INTERNAL_ORIGIN,
        chain: params.chain ?? null,
        prevChain: null,
      });
      await updateNetworks();
      return result;
    },
    onSuccess: () => navigate(BACK_ROUTE, { state: { direction: 'back' } }),
  });

  const restrictedChainIds = useMemo(() => {
    if (!networks) return new Set<string>();
    return new Set(
      networks
        .getNetworks()
        .filter(NetworksModule.isEip155)
        .map((n) => {
          try {
            return NetworksModule.getChainId(n);
          } catch {
            return null;
          }
        })
        .filter(isTruthy)
    );
  }, [networks]);

  const handleCustomSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formObject = collectData(e.currentTarget, parsers);
    const chainId = parsers.chainId(formObject.chainId);

    if (restrictedChainIds.has(chainId)) {
      setErrors({ chainId: 'Network already exists' });
      return;
    }

    const chainConfig: AddEthereumChainParameter = {
      chainName: formObject.chainName,
      rpcUrls: [formObject.rpcUrl],
      chainId,
      nativeCurrency: formObject.nativeCurrency,
      blockExplorerUrls: formObject.blockExplorerUrl
        ? [formObject.blockExplorerUrl]
        : [],
      hidden: !isVisible,
      is_testnet: isTestnet,
    };

    saveMutation.mutate({ chain: toCustomNetworkId(chainId), chainConfig });
  };

  return (
    <Layout
      title="Add Network"
      onBack={() => navigate(BACK_ROUTE, { state: { direction: 'back' } })}
      wrapped={false}
    >
      <Tabs defaultValue="browse" className="flex flex-col min-h-0 gap-0!">
        <TabsList
          variant="line"
          className="w-full border-b border-border rounded-none h-auto pb-0 mb-4"
        >
          <TabsTrigger value="browse" className="flex-1 pb-2.5 text-sm">
            Browse
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex-1 pb-2.5 text-sm">
            Custom
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="browse"
          className="flex flex-col flex-1 min-h-0 space-y-4"
        >
          <Input
            placeholder="Search network or Chain ID..."
            icon={IoSearchOutline}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <SearchResults
              networks={networks}
              query={searchQuery}
              testnetMode={isTestnetMode}
            />
          </div>
        </TabsContent>

        <TabsContent
          value="custom"
          className="flex flex-col flex-1 min-h-0 overflow-y-auto no-scrollbar"
        >
          <form onSubmit={handleCustomSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <FormField
                label="Network Name"
                name="chainName"
                placeholder="e.g. Ethereum Mainnet"
                required
              />
              <FormField
                label="RPC URL"
                name="rpcUrl"
                placeholder="https://mainnet.infura.io/v3/..."
                type="url"
                required
              />
              <FormField
                label="Chain ID"
                name="chainId"
                placeholder="e.g. 1"
                required
                error={errors.chainId}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Symbol"
                  name="nativeCurrency.symbol"
                  placeholder="e.g. ETH"
                  required
                />
                <FormField
                  label="Decimals"
                  name="nativeCurrency.decimals"
                  placeholder="18"
                  type="number"
                  defaultValue="18"
                />
              </div>
              <FormField
                label="Explorer URL"
                name="blockExplorerUrl"
                placeholder="https://etherscan.io"
                type="url"
              />
            </div>

            <Card className="border border-border">
              <CardItem
                item={{
                  label: 'Visible in Networks List',
                  onClick: () => setIsVisible(!isVisible),
                  rightElement: (
                    <Switch
                      id="visible-in-network-list"
                      checked={isVisible}
                      onCheckedChange={setIsVisible}
                    />
                  ),
                  className: 'border-border py-3',
                }}
              />
              <CardItem
                item={{
                  label: 'Testnet',
                  onClick: () => setIsTestnet(!isTestnet),
                  rightElement: (
                    <Switch
                      id="testnet"
                      checked={isTestnet}
                      onCheckedChange={setIsTestnet}
                    />
                  ),
                  className: 'border-border py-3',
                }}
              />
            </Card>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Adding...' : 'Add Network'}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
