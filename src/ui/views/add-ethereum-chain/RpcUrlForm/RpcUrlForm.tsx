import { AddEthereumChainParameter } from '@/modules/ethereum/types/add-ethereum-chain-parameter';
import { createChain } from '@/modules/networks/chain';
import { toAddEthereumChainParameter } from '@/modules/networks/helpers';
import { NetworkConfig } from '@/modules/networks/network-config';
import { collectData } from '@/shared/form-data';
import { DelayedRender } from '@/ui/components/DelayedRender';
import { FormField } from '@/ui/components/form';
import { ViewLoading } from '@/ui/components/view-loading';
import { useNetworks } from '@/ui/hooks/request/internal/useNetworks';
import { Button } from '@/ui/ui-kit';
import { produce } from 'immer';
import merge from 'lodash/merge';
import { useId } from 'react';
import { LuArrowDown } from 'react-icons/lu';
import { Link } from 'react-router-dom';

export function RpcUrlForm({
  network,
  prevNetwork,
  isSubmitting,
  onSubmit,
  onKeepCurrent,
  rpcUrlHelpHref,
}: {
  network: NetworkConfig;
  prevNetwork: NetworkConfig;
  rpcUrlHelpHref: string;
  isSubmitting: boolean;
  onSubmit: (chain: string, result: AddEthereumChainParameter) => void;
  onKeepCurrent: () => void;
}) {
  const { networks } = useNetworks();

  const currentRpcUrl = networks?.getRpcUrlInternal(
    createChain(prevNetwork.id)
  );

  const id = useId();

  if (!networks) {
    return (
      <DelayedRender>
        <ViewLoading />
      </DelayedRender>
    );
  }

  return (
    <form
      id={id}
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.checkValidity()) {
          return;
        }
        const formObject = collectData(form, {});
        const result = produce(prevNetwork, (draft) =>
          merge(draft, formObject)
        );
        onSubmit(network.id, toAddEthereumChainParameter(result));
      }}
      className="flex flex-col h-full gap-4"
    >
      <FormField
        label="Current RPC URL"
        type="url"
        defaultValue={currentRpcUrl || ''}
        readOnly={true}
        name={undefined}
        required={true}
        wrapperClassName="opacity-60 pointer-events-none select-none"
      />

      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <LuArrowDown className="text-muted-foreground shrink-0" />
        <div className="h-px flex-1 bg-border" />
      </div>

      <FormField
        label="New RPC URL"
        name={
          prevNetwork.rpc_url_internal || prevNetwork.rpc_url_user
            ? 'rpc_url_user'
            : 'rpc_url_public[]'
        }
        type="url"
        defaultValue={network.rpc_url_public?.[0] || ''}
        required={true}
      />

      <p className="text-xs text-muted-foreground px-1">
        You can always revert this change and switch back to the default RPC URL
        from your network settings at any time.
      </p>

      <Link
        to={rpcUrlHelpHref}
        className="text-xs px-1 tracking-wider text-teal-600 hover:underline"
      >
        What is RPC URLs and Potential Risks
      </Link>

      <div className="w-full mt-auto grid grid-cols-2 gap-2">
        <Button type="button" variant="secondary" onClick={onKeepCurrent}>
          Keep Current
        </Button>
        <Button form={id} disabled={isSubmitting} variant="primary">
          {isSubmitting ? 'Loading...' : 'Accept'}
        </Button>
      </div>
    </form>
  );
}
