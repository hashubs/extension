import { hasChecksumError } from '@/modules/ethereum/to-checksum-address';
import { isSolanaAddress } from '@/modules/solana/shared';
import { accountPublicRPCPort, walletPort } from '@/shared/channel';
import { getError } from '@/shared/errors/get-error';
import { isEthereumAddress } from '@/shared/is-ethereum-address';
import { queryClient } from '@/shared/query-client/queryClient';
import { ApiClient } from '@/shared/request/api.client';
import { setCurrentAddress } from '@/shared/request/internal/setCurrentAddress';
import { Header } from '@/ui/components/header';
import { QUERY_WALLET } from '@/ui/hooks/request/internal/useWallet';
import { useCustomValidity } from '@/ui/hooks/useCustomValidity';
import { Button, Input } from '@/ui/ui-kit';
import { DebouncedInput } from '@/ui/ui-kit/input/debounced-input';
import { useMutation, useQuery } from '@tanstack/react-query';
import { HTTPError } from 'ky';
import { useId, useRef, useState } from 'react';
import { CgSpinner } from 'react-icons/cg';
import { LuSearch } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

function isValidAddress(address: string) {
  return isEthereumAddress(address) || isSolanaAddress(address);
}
async function submitReadonlyAddress({ address }: { address: string }) {
  await walletPort.request('uiImportReadonlyAddress', {
    address,
    name: null,
  });
  await accountPublicRPCPort.request('saveUserAndWallet');
  await setCurrentAddress({ address });
}

function getHints(
  query: string,
  data: undefined | Awaited<ReturnType<(typeof ApiClient)['walletGetMetadata']>>
): { address: string | null; domains: string[] | null } {
  if (!data || !data.data?.length) {
    return { address: null, domains: null };
  }

  const domains = data.data[0]?.identities.map((value) => value.handle) || null;
  if (isValidAddress(query)) {
    return { address: null, domains };
  } else {
    return { address: data.data[0]?.address ?? null, domains };
  }
}

async function lookup(value: string) {
  const result = await ApiClient.walletGetMetadata({ identifiers: [value] });
  if (!result.data || result.data.length === 0) {
    throw new Error('No resolved identities');
  }
  return result;
}

async function lookupAddressByQuery(query: string) {
  try {
    const promises = [lookup(query)];
    if (
      !isValidAddress(query) &&
      !query.endsWith('.eth') &&
      !query.endsWith('.lens')
    ) {
      promises.push(lookup(`${query}.eth`));
      promises.push(lookup(`${query}.lens`));
    }
    return await Promise.any(promises);
  } catch (unknownError) {
    const error =
      unknownError instanceof AggregateError
        ? unknownError.errors[0]
        : unknownError;
    if (error instanceof HTTPError) {
      const payload = await (error as HTTPError).response.json();
      const message = payload.errors?.[0]?.title;
      if (message) {
        throw new Error(message);
      }
    }
    throw error;
  }
}

export function AddReadOnlyAddressView() {
  const formId = useId();
  const navigate = useNavigate();

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: submitReadonlyAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_WALLET.walletGroups });
      navigate('/overview');
    },
  });

  const [debouncedValue, setDebouncedValue] = useState('');
  const query = debouncedValue.trim();
  const isSupportedAddress = isValidAddress(query);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['lookupAddressByQuery', query],
    queryFn: async () => lookupAddressByQuery(query),
    staleTime: 20000,
    retry: 0,
    enabled: Boolean(query),
  });

  const isDomainResolving = query && isLoading && !isSupportedAddress;
  const resolveError = isError && !isSupportedAddress;

  useCustomValidity({
    ref: inputRef,
    customValidity: isSupportedAddress
      ? '' // Form MUST be valid for valid eth address regardless of the getWalletsMeta request state
      : isDomainResolving
      ? 'Wait until address is resolved'
      : resolveError
      ? 'Address not recognized'
      : '',
  });

  // Do not _display_ error for input like {hello},
  // only show for inputs like {hello.}, {hello.eth}, etc
  // NOTE: form error (custom validity) must still be set
  const errorMessage =
    isError && query.includes('.') ? getError(error).message : null;
  const hints = getHints(query, data);

  const title = 'Watch Address';
  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <Header title={title} onBack={() => navigate(-1)} />
      <div className="flex-1 flex flex-col p-4 pt-0 space-y-4 no-scrollbar overflow-y-auto">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
            Search or paste an address, domain or identity to start watching a
            wallet.
          </p>
        </div>

        <form
          id={formId}
          className="flex-1 flex flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const data = new FormData(form);
            if (form.checkValidity()) {
              const address = data.get('address') as string | null;
              if (!address) {
                throw new Error('No address value found on form');
              }
              mutate({ address });
            }
          }}
        >
          <input
            type="hidden"
            name="address"
            value={isSupportedAddress ? query : hints.address ?? ''}
            required={true}
          />

          <div className="flex flex-col gap-4 flex-1">
            <div className="relative group">
              <DebouncedInput
                value={debouncedValue}
                onChange={(value) => {
                  setDebouncedValue(value);
                }}
                render={({ value, handleChange }) => (
                  <Input
                    ref={inputRef}
                    name="addressOrDomain"
                    placeholder="Address, domain or identity"
                    className="pr-11 h-12"
                    value={value}
                    onChange={(event) =>
                      handleChange(event.currentTarget.value)
                    }
                    required={true}
                  />
                )}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                {isLoading ? (
                  <CgSpinner className="w-5 h-5 animate-spin" />
                ) : (
                  <LuSearch className="w-5 h-5 opacity-50 group-focus-within:opacity-100 transition-opacity" />
                )}
              </div>
            </div>

            {isSupportedAddress && hasChecksumError(query) ? (
              <p className="text-xs text-orange-500 font-medium px-1">
                Warning: address might have an error
              </p>
            ) : null}

            {errorMessage ? (
              <p className="text-xs text-red-500 font-medium px-1">
                {errorMessage}
              </p>
            ) : hints.address ? (
              <div className="bg-muted/30 rounded-xl p-3 space-y-1">
                <p className="text-xs font-mono break-all opacity-70">
                  {hints.address}
                </p>
                {hints.domains && !hints.domains.includes(query) ? (
                  <p className="text-xs text-primary font-medium">
                    {hints.domains.join(', ')}
                  </p>
                ) : null}
              </div>
            ) : hints.domains?.length ? (
              <div className="bg-muted/30 rounded-xl p-3">
                <p className="text-xs text-primary font-medium text-center">
                  {hints.domains.join(', ')}
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-auto pt-4 border-t border-muted/20">
            <Button
              type="submit"
              variant="primary"
              disabled={
                isSubmitting ||
                (query !== '' && !isSupportedAddress && !hints.address)
              }
            >
              {isSubmitting ? 'Adding...' : 'Continue'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
