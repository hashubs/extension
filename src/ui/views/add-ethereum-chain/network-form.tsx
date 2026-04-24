import { ChainId } from '@/modules/ethereum/transactions/chainId';
import { AddEthereumChainParameter } from '@/modules/ethereum/types/add-ethereum-chain-parameter';
import { collectData } from '@/shared/form-data';
import { normalizeChainId } from '@/shared/normalize-chain-id';
import { apostrophe } from '@/shared/typography';
import { FormField } from '@/ui/components/form';
import { Button, Card, CardItem } from '@/ui/ui-kit';
import { Switch } from '@/ui/ui-kit/switch';
import { produce } from 'immer';
import merge from 'lodash/merge';
import { useId, useState } from 'react';
import {
  isCustomNetworkId,
  toCustomNetworkId,
} from 'src/modules/ethereum/chains/helpers';

function NetworkHiddenFieldLine({
  name,
  defaultChecked,
}: {
  name: string;
  defaultChecked?: boolean;
}) {
  const [hidden, setHidden] = useState(defaultChecked ?? false);
  return (
    <div>
      <CardItem
        item={{
          label: 'Visible in Networks List',
          onClick: () => setHidden(!hidden),
          rightElement: (
            <Switch
              id="visible-in-network-list"
              checked={!hidden}
              onCheckedChange={(val) => setHidden(!val)}
            />
          ),
          className: 'border-border py-3',
        }}
      />
      <input name={name} type="hidden" value={hidden ? 'on' : ''} />
    </div>
  );
}

function NetworkTestnetFieldLine({
  name,
  defaultChecked,
}: {
  name: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked ?? false);
  return (
    <div>
      <CardItem
        item={{
          label: 'Testnet',
          onClick: () => setChecked(!checked),
          rightElement: (
            <Switch
              id="testnet"
              checked={checked}
              onCheckedChange={setChecked}
            />
          ),
          className: 'border-border py-3',
        }}
      />
      <input name={name} type="hidden" value={checked ? 'on' : ''} />
    </div>
  );
}

type Validators = Record<
  string,
  (element: HTMLInputElement) => string | undefined
>;

function collectErrors(form: HTMLFormElement, validators: Validators) {
  const errors: Record<string, string | undefined> = {};
  for (const element of form.elements) {
    if (element instanceof HTMLInputElement) {
      const validity = validators[element.name]?.(element);
      if (validity) errors[element.name] = validity;
      element.setCustomValidity(validity ?? '');
    }
  }
  return errors;
}

function findInput(
  elements: HTMLFormControlsCollection,
  predicate: (el: HTMLInputElement) => boolean
) {
  return Array.from(elements).find((el): el is HTMLInputElement => {
    return el instanceof HTMLInputElement && predicate(el);
  });
}

function hasChanges(form: HTMLFormElement) {
  for (const element of form.elements) {
    if (element instanceof HTMLInputElement) {
      if (element.value !== element.defaultValue) return true;
    }
  }
  return false;
}

const parsers = {
  chainId: (untypedValue: unknown) => normalizeChainId(untypedValue as string),
  hidden: (untypedValue: unknown) => Boolean(untypedValue as 'on' | null),
  is_testnet: (untypedValue: unknown) => Boolean(untypedValue as 'on' | null),
  'nativeCurrency.decimals': (untypedValue: unknown) =>
    Number(untypedValue as string),
};

const EMPTY_OBJECT = {};

export function NetworkForm({
  chain,
  chainConfig,
  submitText = 'Save',
  isSubmitting,
  onSubmit,
  onCancel,
  onReset,
  onRemoveFromVisited,
  restrictedChainIds,
  disabledFields,
}: {
  chain?: string | null;
  chainConfig: AddEthereumChainParameter;
  isSubmitting: boolean;
  submitText?: string;
  onSubmit: (chain: string, result: AddEthereumChainParameter) => void;
  onCancel: () => void;
  onReset?: () => void;
  onRemoveFromVisited?: () => void;
  restrictedChainIds: Set<ChainId>;
  disabledFields: null | Set<string>;
}) {
  const id = useId();

  const validators: Validators = {
    chainId: (element) => {
      const value = parsers.chainId(element.value);
      if (restrictedChainIds.has(value)) return 'Network already exists';
      try {
        normalizeChainId(value);
        normalizeChainId(Number(value));
      } catch {
        return `Unsupported chainId${apostrophe}s format`;
      }
    },
  };

  const [errors, setErrors] =
    useState<Record<string, string | undefined>>(EMPTY_OBJECT);

  return (
    <form
      id={id}
      onChange={() => setErrors(EMPTY_OBJECT)}
      onSubmit={(event) => {
        event.preventDefault();
        if (!hasChanges(event.currentTarget)) {
          onCancel();
          return;
        }
        const { elements } = event.currentTarget;
        const formErrors = collectErrors(event.currentTarget, validators);
        setErrors(formErrors);
        if (!event.currentTarget.checkValidity()) {
          const input = findInput(elements, (e) => e.name in formErrors);
          input?.focus();
          return;
        }
        const formObject = collectData(event.currentTarget, parsers);
        const result = produce(chainConfig, (draft) =>
          merge(draft, formObject)
        );
        onSubmit(
          !chain || isCustomNetworkId(chain)
            ? toCustomNetworkId(result.chainId)
            : chain,
          result
        );
      }}
      className="flex flex-col h-full gap-4"
    >
      <div className="flex flex-col gap-4">
        <FormField
          label="Network Name"
          name="chainName"
          defaultValue={chainConfig.chainName}
          disabled={disabledFields?.has('chainName')}
          required
        />
        <FormField
          label="RPC URL"
          name="rpcUrls[]"
          placeholder={chainConfig.rpcUrls[0]}
          type="url"
          defaultValue={chainConfig.rpcUrls[0] || ''}
          error={errors['rpcUrls[]']}
          disabled={disabledFields?.has('rpcUrls[]')}
          required
        />
        <FormField
          label="Chain ID"
          name="chainId"
          title={chainConfig.chainId}
          defaultValue={
            chainConfig.chainId ? String(parseInt(chainConfig.chainId)) : ''
          }
          pattern="^0x[\dabcdef]+|\d+"
          error={errors.chainId}
          onInvalid={(e) =>
            e.currentTarget.setCustomValidity(
              'Chain ID must be either a 0x-prefixed hex value or an integer'
            )
          }
          onInput={(e) => e.currentTarget.setCustomValidity('')}
          disabled={disabledFields?.has('chainId')}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Currency Symbol"
            name="nativeCurrency.symbol"
            defaultValue={chainConfig.nativeCurrency.symbol || ''}
            error={errors['nativeCurrency.symbol']}
            onInput={(e) => e.currentTarget.setCustomValidity('')}
            disabled={disabledFields?.has('nativeCurrency.symbol')}
            required
          />
          <FormField
            label="Decimals"
            name="nativeCurrency.decimals"
            error={errors['nativeCurrency.decimals']}
            placeholder="18"
            inputMode="decimal"
            pattern="\d+"
            defaultValue={chainConfig.nativeCurrency.decimals || ''}
            disabled={disabledFields?.has('nativeCurrency.decimals')}
            required={false}
          />
        </div>
        <FormField
          label="Block Explorer URL (optional)"
          type="url"
          name="blockExplorerUrls[]"
          data-parser-name="toLowerCase"
          error={errors['blockExplorerUrls[]']}
          placeholder="https://..."
          defaultValue={chainConfig.blockExplorerUrls?.[0] || ''}
          disabled={disabledFields?.has('blockExplorerUrls[]')}
          required={false}
        />
      </div>

      <Card className="border border-border mt-4">
        {!disabledFields?.has('hidden') && (
          <NetworkHiddenFieldLine
            name="hidden"
            defaultChecked={chainConfig.hidden}
          />
        )}

        {!disabledFields?.has('is_testnet') && (
          <NetworkTestnetFieldLine
            name="is_testnet"
            defaultChecked={chainConfig.is_testnet}
          />
        )}
      </Card>

      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          className="mt-6 w-full text-center text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Reset to Default
        </button>
      ) : onRemoveFromVisited ? (
        <button
          type="button"
          onClick={onRemoveFromVisited}
          className="mt-6 w-full text-center text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Remove from the list
        </button>
      ) : null}

      <div className="w-full mt-auto grid grid-cols-2 gap-2">
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button
          type="submit"
          form={id}
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Loading...' : submitText}
        </Button>
      </div>
    </form>
  );
}
