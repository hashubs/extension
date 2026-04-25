import { AddEthereumChainParameter } from '@/modules/ethereum/types/add-ethereum-chain-parameter';
import { injectChainConfig } from '@/modules/networks/inject-chain-config';
import { Networks } from '@/modules/networks/networks';
import { walletPort, windowPort } from '@/shared/channels';
import { normalizeChainId } from '@/shared/normalize-chain-id';
import { SiteFaviconImg } from '@/ui/components/SiteFaviconImg';
import { Layout } from '@/ui/components/layout';
import { ViewLoading } from '@/ui/components/view-loading';
import { useNetworks } from '@/ui/hooks/request/internal/useNetworks';
import { CardItem } from '@/ui/ui-kit';
import { useMutation, useQuery } from '@tanstack/react-query';
import { isTruthy } from 'is-truthy-ts';
import { useCallback, useMemo, useState } from 'react';
import { Route, Routes, useSearchParams } from 'react-router-dom';
import type { EthereumChainConfig } from 'src/modules/ethereum/chains/types';
import {
  toAddEthereumChainParameter,
  toNetworkConfig,
} from 'src/modules/networks/helpers';
import {
  mainNetworksStore,
  testenvNetworksStore,
} from 'src/modules/networks/networks-store.client';
import { invariant } from 'src/shared/invariant';
import { RpcUrlForm } from './RpcUrlForm';
import { RpcUrlHelp } from './RpcUrlHelp';
import { NetworkForm } from './network-form';
import { NetworkCreateSuccess, NetworkUpdateSuccess } from './success';

interface AddChainResult {
  config: EthereumChainConfig;
  prevChainConfig: AddEthereumChainParameter | null;
}

function AddOrUpdateChain({
  origin,
  addEthereumChainParameterStringified,
  onKeepCurrent,
  onReject,
  onSuccess,
}: {
  origin: string;
  addEthereumChainParameterStringified: string;
  onKeepCurrent: () => void;
  onReject: () => void;
  onSuccess: (value: AddChainResult) => void;
}) {
  const [params] = useSearchParams();
  const hostname = useMemo(() => new URL(origin).hostname, [origin]);

  const addEthereumChainParameter = useMemo(
    () =>
      JSON.parse(
        addEthereumChainParameterStringified
      ) as AddEthereumChainParameter,
    [addEthereumChainParameterStringified]
  );

  const chainId = normalizeChainId(addEthereumChainParameter.chainId);
  const { networks, loadNetworkByChainId } = useNetworks();

  const { data: updatedNetworks, isLoading } = useQuery({
    queryKey: ['loadNetworkByChainId', chainId],
    queryFn: () => loadNetworkByChainId(chainId),
    enabled: Boolean(chainId),
  });

  const { network, prevNetwork } = useMemo(() => {
    const prevNetwork = updatedNetworks?.hasNetworkById(chainId)
      ? updatedNetworks.getNetworkById(chainId) ?? null
      : null;
    const network = prevNetwork
      ? injectChainConfig(prevNetwork, addEthereumChainParameter)
      : toNetworkConfig(addEthereumChainParameter, null);
    return { network, prevNetwork };
  }, [addEthereumChainParameter, updatedNetworks, chainId]);

  const addEthereumChainMutation = useMutation({
    mutationFn: async ({
      networkId,
      param,
    }: {
      networkId: string;
      param: AddEthereumChainParameter;
    }) => {
      const config = await walletPort.request('addEthereumChain', {
        values: [param],
        origin,
        chain: networkId,
        prevChain: null,
      });
      return {
        config,
        prevChainConfig: prevNetwork
          ? toAddEthereumChainParameter(prevNetwork)
          : null,
      };
    },
    onSuccess: async (result) => {
      mainNetworksStore.update();
      testenvNetworksStore.update();
      onSuccess(result);
    },
  });

  const restrictedChainIds = useMemo(() => {
    return networks
      ? new Set(
          networks
            .getEvmNetworks()
            .map((n) => Networks.getChainId(n))
            .filter(isTruthy)
        )
      : null;
  }, [networks]);

  if (!restrictedChainIds || isLoading) {
    return <ViewLoading />;
  }

  return (
    <Layout wrapped={false}>
      <div className="sticky top-0 bg-background w-full pb-4 mb-4 border-b border-border z-50">
        <CardItem
          item={{
            label: hostname,
            subLabel: `Suggests you ${
              prevNetwork ? 'update RPC URL' : 'add this network'
            }`,
            iconNode: <SiteFaviconImg url={origin} alt={hostname} size={32} />,
            iconClassName: 'size-10',
            className:
              'p-0 cursor-default hover:bg-transparent dark:hover:bg-transparent',
          }}
        />
      </div>
      {prevNetwork ? (
        <RpcUrlForm
          network={network}
          prevNetwork={prevNetwork}
          rpcUrlHelpHref={`/addEthereumChain/what-is-rpc-url?${params}`}
          isSubmitting={addEthereumChainMutation.isPending}
          onKeepCurrent={onKeepCurrent}
          onSubmit={(networkId, result) => {
            addEthereumChainMutation.mutate({
              networkId,
              param: result,
            });
          }}
        />
      ) : (
        <NetworkForm
          chain={network.id}
          chainConfig={addEthereumChainParameter}
          submitText="Add"
          isSubmitting={addEthereumChainMutation.isPending}
          onCancel={onReject}
          onSubmit={(networkId, result) => {
            addEthereumChainMutation.mutate({
              networkId,
              param: result,
            });
          }}
          restrictedChainIds={restrictedChainIds}
          disabledFields={null}
        />
      )}
    </Layout>
  );
}

function AddEthereumChainContent({
  origin,
  addEthereumChainParameterStringified,
  onReject,
  onDone,
}: {
  origin: string;
  addEthereumChainParameterStringified: string;
  onReject: () => void;
  onDone: () => void;
}) {
  const [result, setResult] = useState<AddChainResult | null>(null);

  if (result) {
    return result.prevChainConfig ? (
      <NetworkUpdateSuccess
        chainConfig={result.config.value}
        prevChainConfig={result.prevChainConfig}
        onClose={onDone}
      />
    ) : (
      <NetworkCreateSuccess
        chainConfig={result.config.value}
        onClose={onDone}
      />
    );
  }

  return (
    <AddOrUpdateChain
      addEthereumChainParameterStringified={
        addEthereumChainParameterStringified
      }
      origin={origin}
      onKeepCurrent={onDone}
      onReject={onReject}
      onSuccess={(result) => setResult(result)}
    />
  );
}

export function AddEthereumChain() {
  const [params] = useSearchParams();
  const origin = params.get('origin');
  const addEthereumChainParameter = params.get('addEthereumChainParameter');
  const windowId = params.get('windowId');
  invariant(origin, 'origin get-parameter is required for this view');
  invariant(windowId, 'windowId get-parameter is required for this view');
  invariant(
    addEthereumChainParameter,
    'addEtheretumChainParameter get-parameter is required for this view'
  );

  const handleReject = useCallback(
    () => windowPort.reject(windowId),
    [windowId]
  );

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <AddEthereumChainContent
              addEthereumChainParameterStringified={addEthereumChainParameter}
              origin={origin}
              onReject={handleReject}
              onDone={useCallback(
                () => windowPort.confirm(windowId, null),
                [windowId]
              )}
            />
          }
        />
        <Route path="/what-is-rpc-url" element={<RpcUrlHelp />} />
      </Routes>
    </>
  );
}
