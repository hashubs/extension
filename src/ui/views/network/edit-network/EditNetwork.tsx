import { INTERNAL_ORIGIN } from '@/background/constants';
import { isCustomNetworkId } from '@/modules/ethereum/chains/helpers';
import { type AddEthereumChainParameter } from '@/modules/ethereum/types/add-ethereum-chain-parameter';
import { createChain } from '@/modules/networks/chain';
import { toAddEthereumChainParameter } from '@/modules/networks/helpers';
import { Networks } from '@/modules/networks/networks';
import { walletPort } from '@/shared/channel';
import { invariant } from '@/shared/invariant';
import { Header } from '@/ui/components/header';
import { useNetworks } from '@/ui/hooks/request/internal/useNetworks';
import { Button } from '@/ui/ui-kit';
import { Card, CardItem } from '@/ui/ui-kit/card';
import { Switch } from '@/ui/ui-kit/switch';
import { useMutation } from '@tanstack/react-query';
import { isEqual } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { IoTrashOutline } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router-dom';
import { FormField } from '../_shared/FormField';
import { updateNetworks } from '../_shared/updateNetworks';

export function EditNetwork() {
  const { id: chainStr } = useParams();
  invariant(chainStr, 'chain id is required');
  const navigate = useNavigate();
  const { networks } = useNetworks();

  const network = networks?.getNetworkByName(createChain(chainStr));
  const chainConfig = useMemo(
    () => (network ? toAddEthereumChainParameter(network) : null),
    [network]
  );

  const [localConfig, setLocalConfig] =
    useState<AddEthereumChainParameter | null>(chainConfig);

  useEffect(() => {
    if (chainConfig && !localConfig) {
      setLocalConfig(chainConfig);
    }
  }, [chainConfig, localConfig]);

  const isDirty = useMemo(() => {
    if (!localConfig || !chainConfig) return false;

    const normalize = (config: AddEthereumChainParameter) => ({
      ...config,
      rpcUrls: config.rpcUrls.filter((url) => url.trim() !== ''),
      blockExplorerUrls:
        config.blockExplorerUrls?.filter((url) => url.trim() !== '') || [],
    });

    return !isEqual(normalize(localConfig), normalize(chainConfig));
  }, [localConfig, chainConfig]);

  const saveMutation = useMutation({
    mutationFn: async (config: AddEthereumChainParameter) => {
      await walletPort.request('addEthereumChain', {
        values: [config],
        origin: INTERNAL_ORIGIN,
        chain: chainStr ?? null,
        prevChain: chainStr ?? null,
      });
      await updateNetworks();
    },
    onSuccess: () => navigate(-1),
  });

  const toggleMutation = useMutation({
    mutationFn: async (config: AddEthereumChainParameter) => {
      await walletPort.request('addEthereumChain', {
        values: [config],
        origin: INTERNAL_ORIGIN,
        chain: chainStr ?? null,
        prevChain: chainStr ?? null,
      });
      await updateNetworks();
    },
  });

  const removeMutation = useMutation({
    mutationFn: async () => {
      if (!network) return;
      await walletPort.request('removeEthereumChain', { chain: network.id });
      await updateNetworks();
    },
    onSuccess: () => navigate(-1),
  });

  if (!network || !chainConfig || !localConfig) {
    return null;
  }

  const isEip155 = Networks.isEip155(network);

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <Header
        title={network.name}
        onBack={() => navigate(-1)}
        right={
          isCustomNetworkId(network.id) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeMutation.mutate()}
              className="text-destructive"
            >
              <IoTrashOutline size={20} />
            </Button>
          )
        }
      />

      <div className="flex-1 space-y-4 no-scrollbar px-4 overflow-y-auto">
        <Card className="border border-border divide-none">
          <CardItem
            item={{
              label: 'Network Enabled',
              subLabel: 'Show this network across the wallet',
              onClick: () => {
                const nextHidden = !network.hidden;
                const newConfig = { ...localConfig, hidden: nextHidden };
                setLocalConfig(newConfig);
                toggleMutation.mutate(newConfig);
              },
              rightElement: (
                <Switch
                  checked={!network.hidden}
                  onCheckedChange={(val: boolean) => {
                    const newConfig = { ...localConfig, hidden: !val };
                    setLocalConfig(newConfig);
                    toggleMutation.mutate(newConfig);
                  }}
                />
              ),
            }}
          />
        </Card>

        <Card className="border border-border">
          <FormField
            label="Network Name"
            wrapperClassName="p-3"
            value={localConfig.chainName}
            onChange={(e: any) =>
              setLocalConfig({ ...localConfig, chainName: e.target.value })
            }
          />
          {isEip155 && (
            <FormField
              label="Chain ID"
              wrapperClassName="p-3"
              value={String(parseInt(localConfig.chainId))}
              disabled
            />
          )}
          <div className="grid grid-cols-2">
            <FormField
              label="Symbol"
              wrapperClassName="p-3"
              value={localConfig.nativeCurrency.symbol}
              onChange={(e: any) =>
                setLocalConfig({
                  ...localConfig,
                  nativeCurrency: {
                    ...localConfig.nativeCurrency,
                    symbol: e.target.value,
                  },
                })
              }
            />
            <FormField
              label="Decimals"
              wrapperClassName="p-3"
              value={String(localConfig.nativeCurrency.decimals)}
              disabled
            />
          </div>

          <FormField
            label="RPC URL"
            wrapperClassName="p-3"
            value={localConfig.rpcUrls[0] || ''}
            onChange={(e: any) =>
              setLocalConfig({
                ...localConfig,
                rpcUrls: [e.target.value],
              })
            }
          />

          <FormField
            label="Explorer URL"
            wrapperClassName="p-3"
            value={localConfig.blockExplorerUrls?.[0] || ''}
            onChange={(e: any) =>
              setLocalConfig({
                ...localConfig,
                blockExplorerUrls: [e.target.value],
              })
            }
          />

          <CardItem
            item={{
              label: 'Testnet',
              subLabel: 'Mark this as a test network',
              onClick: () =>
                setLocalConfig((prev) =>
                  prev ? { ...prev, is_testnet: !prev.is_testnet } : null
                ),
              rightElement: (
                <Switch
                  checked={!!localConfig.is_testnet}
                  onCheckedChange={() =>
                    setLocalConfig((prev) =>
                      prev ? { ...prev, is_testnet: !prev.is_testnet } : null
                    )
                  }
                />
              ),
            }}
          />
        </Card>

        <Button
          variant="primary"
          size="md"
          onClick={() => saveMutation.mutate(localConfig)}
          disabled={
            !isDirty || saveMutation.isPending || toggleMutation.isPending
          }
        >
          {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
