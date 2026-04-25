import { INTERNAL_ORIGIN } from '@/background/constants';
import { isCustomNetworkId } from '@/modules/ethereum/chains/helpers';
import { type AddEthereumChainParameter } from '@/modules/ethereum/types/add-ethereum-chain-parameter';
import { createChain } from '@/modules/networks/chain';
import { toAddEthereumChainParameter } from '@/modules/networks/helpers';
import { NetworkConfig } from '@/modules/networks/network-config';
import { Networks as NetworksModule } from '@/modules/networks/networks';
import { walletPort } from '@/shared/channels';
import { invariant } from '@/shared/invariant';
import { Layout } from '@/ui/components/layout';
import { useNetworks } from '@/ui/hooks/request/internal/useNetworks';
import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
} from '@/ui/ui-kit';
import { Card, CardItem } from '@/ui/ui-kit/card';
import { Switch } from '@/ui/ui-kit/switch';
import { useMutation } from '@tanstack/react-query';
import { isTruthy } from 'is-truthy-ts';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PiTrashSimple } from 'react-icons/pi';
import { useNavigate, useParams } from 'react-router-dom';
import { NetworkForm } from '../../add-ethereum-chain/network-form';
import { updateNetworks } from './_shared/updateNetworks';

const BACK_ROUTE = '/settings/manage-networks';

const BACKEND_NETWORK_ORIGIN = 'backend';

type SaveChainConfigParams = {
  chain: string;
  chainConfig: AddEthereumChainParameter;
  prevChain: string | null;
};

async function saveChainConfig({
  chain,
  chainConfig,
  prevChain,
}: SaveChainConfigParams) {
  return walletPort.request('addEthereumChain', {
    values: [chainConfig],
    origin: isCustomNetworkId(chain) ? INTERNAL_ORIGIN : BACKEND_NETWORK_ORIGIN,
    chain,
    prevChain,
  });
}

const FORBIDDEN_FIELDS = new Set([
  'chainId',
  'nativeCurrency.decimals',
  'hidden',
  'is_testnet',
]);

function DrawerDelete({
  open,
  onOpenChange,
  onDelete,
  isPending,
  networkName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  isPending: boolean;
  networkName: string;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent variant="inset" title="Remove network?">
        <div className="px-4 pb-4 pt-2">
          <h2 className="text-base font-medium text-foreground">
            Are you sure?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {networkName} configuration will be removed
          </p>
        </div>
        <DrawerFooter className="flex flex-row gap-2">
          <DrawerClose asChild>
            <Button size="md" variant="secondary">
              Cancel
            </Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button size="md" variant="danger" onClick={onDelete}>
              {isPending ? 'Removing…' : 'Remove'}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export function EditNetwork() {
  const { id: chainStr } = useParams();
  invariant(chainStr, 'chain id is required');
  const navigate = useNavigate();
  const goBack = useCallback(() => navigate(-1), [navigate]);
  const { networks } = useNetworks();
  const network = networks?.getNetworkByName(createChain(chainStr));

  const [openDelete, setOpenDelete] = useState(false);

  const {
    isCustomNetwork,
    isSavedNetwork,
    isVisitedNetwork,
    isSupportsPositions,
  } = useMemo(() => {
    const chain = createChain(chainStr);
    return {
      isCustomNetwork: isCustomNetworkId(chainStr),
      isSavedNetwork: networks?.isSavedLocallyChain(chain),
      isVisitedNetwork: networks?.isVisitedChain(chain),
      isSupportsPositions: networks?.supports('positions', chain),
    };
  }, [networks, chainStr]);

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

  const restrictedChainIds = useMemo(() => {
    const set = new Set(
      networks
        ?.getNetworks()
        .filter((n) => NetworksModule.isEip155(n))
        .map((n) => NetworksModule.getChainId(n))
        .filter(isTruthy)
    );
    const chainId =
      network && NetworksModule.isEip155(network)
        ? NetworksModule.getChainId(network)
        : null;
    if (chainId) {
      set.delete(chainId);
    }
    return set;
  }, [network, networks]);

  // const isDirty = useMemo(() => {
  //   if (!localConfig || !chainConfig) return false;

  //   const normalize = (config: AddEthereumChainParameter) => ({
  //     ...config,
  //     rpcUrls: config.rpcUrls.filter((url) => url.trim() !== ''),
  //     blockExplorerUrls:
  //       config.blockExplorerUrls?.filter((url) => url.trim() !== '') || [],
  //   });

  //   return !isEqual(normalize(localConfig), normalize(chainConfig));
  // }, [localConfig, chainConfig]);

  const saveMutation = useMutation({
    mutationFn: async (params: SaveChainConfigParams) => {
      await saveChainConfig(params);
      await updateNetworks();
    },
    onSuccess: goBack,
  });
  const removeMutation = useMutation({
    mutationFn: async (network: NetworkConfig) => {
      await walletPort.request('removeEthereumChain', { chain: network.id });
      await updateNetworks();
    },
    onSuccess: goBack,
  });
  const resetMutation = useMutation({
    mutationFn: async (network: NetworkConfig) => {
      await walletPort.request('resetEthereumChain', { chain: network.id });
      await updateNetworks();
    },
    onSuccess: goBack,
  });
  const removeFromVisitedMutation = useMutation({
    mutationFn: async (network: NetworkConfig) => {
      await walletPort.request('removeVisitedEthereumChain', {
        chain: network.id,
      });
      await updateNetworks();
    },
    onSuccess: goBack,
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

  if (!network || !chainConfig || !localConfig) {
    return null;
  }

  const isEip155 = NetworksModule.isEip155(network);

  return (
    <Layout
      title={network.name}
      onBack={() => navigate(BACK_ROUTE, { state: { direction: 'back' } })}
      renderHeaderElement={
        isCustomNetwork && (
          <Button
            iconOnly
            iconOnlySize="md"
            variant="ghost"
            onClick={() => setOpenDelete(true)}
            icon={PiTrashSimple}
          />
        )
      }
      wrapped={false}
    >
      {!isCustomNetwork && (
        <Card className="border border-border divide-none flex rounded-lg">
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
      )}

      <NetworkForm
        chain={chainStr}
        chainConfig={toAddEthereumChainParameter(network)}
        onSubmit={(id, value) =>
          saveMutation.mutate({
            chain: id,
            chainConfig: value,
            prevChain: network.id,
          })
        }
        isSubmitting={saveMutation.isPending}
        onReset={
          isSavedNetwork && !isCustomNetwork
            ? () => resetMutation.mutate(network)
            : undefined
        }
        onRemoveFromVisited={
          // we show networks with supported positions based on the balance
          isVisitedNetwork && !isSupportsPositions
            ? () => removeFromVisitedMutation.mutate(network)
            : undefined
        }
        onCancel={goBack}
        disabledFields={isCustomNetwork ? null : FORBIDDEN_FIELDS}
        restrictedChainIds={restrictedChainIds}
        hiddenFields={!isEip155 ? new Set(['chainId']) : null}
      />

      {isCustomNetwork && (
        <DrawerDelete
          open={openDelete}
          onOpenChange={setOpenDelete}
          onDelete={() => removeMutation.mutate(network)}
          isPending={removeMutation.isPending}
          networkName={network.name}
        />
      )}
    </Layout>
  );
}
