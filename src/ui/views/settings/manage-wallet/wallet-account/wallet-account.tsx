import { walletPort } from '@/shared/channel';
import { invariant } from '@/shared/invariant';
import { queryClient } from '@/shared/query-client/queryClient';
import { ExternallyOwnedAccount } from '@/shared/types/externally-owned-account';
import { isBareWallet, isDeviceAccount } from '@/shared/types/validators';
import { formatFiatToParts } from '@/shared/units/format-fiat';
import { BlockieAddress } from '@/ui/components/Blockie';
import { ConfirmationSheet } from '@/ui/components/Confirmation/confirmation-sheet';
import { Header } from '@/ui/components/header';
import { useProfileName } from '@/ui/hooks/request/internal/useProfileName';
import {
  useWalletGroupByGroupId,
  WALLET_GROUP_QUERY_KEY,
  WALLET_GROUPS_QUERY_KEY,
} from '@/ui/hooks/request/internal/useWalletGroups';
import { useCopyToClipboard } from '@/ui/hooks/useCopyToClipboard';
import { useDebouncedCallback } from '@/ui/hooks/useDebouncedCallback';
import { useFiatConversion } from '@/ui/hooks/useFiatConversion';
import { truncateAddress } from '@/ui/lib/utils';
import { NeutralDecimals } from '@/ui/ui-kit';
import { Card, CardItem, ItemType } from '@/ui/ui-kit/card';
import { InputDecorator } from '@/ui/ui-kit/input/Input-decorator';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useId, useState } from 'react';
import { FiCopy } from 'react-icons/fi';
import { IoKeyOutline, IoLogoUsd } from 'react-icons/io5';
import { LuChevronRight, LuKey, LuTrash } from 'react-icons/lu';
import { MdOutlineBackup, MdOutlineNoAccounts } from 'react-icons/md';
import { PiSpinnerLight } from 'react-icons/pi';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

function EditableWalletName({
  id,
  wallet,
  onRename,
}: {
  id: string;
  wallet: ExternallyOwnedAccount | null;
  onRename?: () => void;
}) {
  const [value, setValue] = useState(wallet?.name || '');
  const { mutate, ...renameMutation } = useMutation({
    mutationFn: (value: string) =>
      walletPort.request('renameAddress', {
        address: wallet?.address || '',
        name: value,
      }),
    onSuccess() {
      onRename?.();
    },
  });
  const debouncedRenameRequest = useDebouncedCallback(
    useCallback((value: string) => mutate(value), [mutate]),
    500
  );
  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-[1fr_auto] items-center gap-1">
        <input
          id={id}
          placeholder={truncateAddress(wallet?.address || '')}
          type="text"
          value={value}
          disabled={wallet?.name === undefined}
          onChange={(event) => {
            const name = event.target.value;
            debouncedRenameRequest(name);
            setValue(name);
          }}
          className="outline-none focus:outline-none focus:ring-0"
        />
        {renameMutation.isPending ? (
          <PiSpinnerLight className="inline-block animate-spin" />
        ) : null}
      </div>
      {renameMutation.isError ? (
        <span className="text-xs text-red-500">
          {(renameMutation.error as Error | null)?.message || 'Unknown Error'}
        </span>
      ) : null}
    </div>
  );
}

function AnimatedDerivationPath() {
  const [path, setPath] = useState("m/44'/60'/x'/x/x");

  useEffect(() => {
    const chars = '0123456789';
    const interval = setInterval(() => {
      const r = () => chars[Math.floor(Math.random() * chars.length)];
      setPath(`m/44'/60'/${r()}'/0/${r()}`);
    }, 60);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-xs text-muted-foreground">
      Derivation path: {path}
    </span>
  );
}

export function WalletAccountView() {
  const { address } = useParams() as { address: string };
  const [params] = useSearchParams();
  const groupId = params.get('groupId');
  invariant(
    groupId,
    'groupId is a required search-param for WalletAccount view'
  );

  const navigate = useNavigate();
  const { convertUsdToFiat, defaultCurrency } = useFiatConversion();
  const { isSuccess: isAddressCopied, handleCopy: handleCopyAddress } =
    useCopyToClipboard({
      text: address,
    });

  const [openConfirm, setOpenConfirm] = useState(false);

  const { data: wallet, refetch: refetchWallet } = useQuery({
    queryKey: ['wallet/uiGetWalletByAddress', address, groupId],
    queryFn: () =>
      walletPort.request('uiGetWalletByAddress', { address, groupId }),
  });

  const { data: walletGroupByGroupId } = useWalletGroupByGroupId({
    groupId,
  });

  const walletName = wallet?.name || null;

  const { value: displayName } = useProfileName({ address, name: walletName });

  const removeAddressMutation = useMutation({
    mutationFn: () => walletPort.request('removeAddress', { address, groupId }),
    onSuccess() {
      refetchWallet();
      navigate(`/settings/manage-wallets/groups/${groupId}`, {
        state: { direction: 'back' },
      });
      queryClient.invalidateQueries({
        queryKey: WALLET_GROUPS_QUERY_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: WALLET_GROUP_QUERY_KEY,
      });
    },
  });

  const nameInputId = useId();

  const handleRemoveAddress = () => {
    removeAddressMutation.mutate();
    setOpenConfirm(false);
  };

  const disableRemove =
    walletGroupByGroupId?.walletContainer.wallets.length === 1;

  const items: ItemType[] = [
    {
      label: 'Export Private Key',
      icon: LuKey,
      iconRight: LuChevronRight,
      onClick: () => {},
    },
    {
      label: 'Remove Wallet',
      icon: LuTrash,
      variant: 'danger',
      disabled: disableRemove,
      onClick: () => {
        if (disableRemove) {
          return;
        }
        setOpenConfirm(true);
      },
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header
        title={displayName}
        onBack={() =>
          navigate(`/settings/manage-wallets/groups/${groupId}`, {
            state: { direction: 'back' },
          })
        }
      />

      <div className="flex-1 p-4 pt-0! space-y-4 overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-2">
          <BlockieAddress address={address} size={52} borderRadius={6} />
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              <NeutralDecimals
                parts={formatFiatToParts(
                  convertUsdToFiat(0), // TODO: get wallet value
                  defaultCurrency
                )}
              />
            </span>
            <div
              role="button"
              onClick={handleCopyAddress}
              className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer"
            >
              {isAddressCopied ? 'Copied!' : truncateAddress(address)}
              <FiCopy size={10} />
            </div>
            {wallet ? (
              isBareWallet(wallet) && wallet.mnemonic ? (
                <span className="text-xs text-muted-foreground">
                  Derivation path: {wallet.mnemonic?.path}
                </span>
              ) : (
                isDeviceAccount(wallet) && (
                  <span className="text-xs text-muted-foreground">
                    HW Derivation path: {wallet.derivationPath}
                  </span>
                )
              )
            ) : (
              <AnimatedDerivationPath />
            )}
          </div>
        </div>

        <InputDecorator
          label="Name"
          htmlFor={nameInputId}
          input={
            <EditableWalletName
              id={nameInputId}
              wallet={wallet || null}
              onRename={refetchWallet}
            />
          }
        />

        <Card>
          {items.map((item, i) => (
            <CardItem key={i} item={item} />
          ))}
        </Card>
      </div>

      <ConfirmationSheet
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        onConfirm={handleRemoveAddress}
        title="Remove Wallet Address"
        heroGradient="from-red-500 to-orange-500"
        heroShadow="shadow-red-500/20"
        heading="Before you proceed"
        confirmLabel="Remove Wallet Address"
        heroIcon={<MdOutlineNoAccounts className="w-8 h-8 text-white" />}
        items={[
          {
            icon: IoKeyOutline,
            className: 'text-red-400',
            text: 'The private key for this address will be permanently deleted from Selvo.',
          },
          {
            icon: IoLogoUsd,
            className: 'text-yellow-400',
            text: 'Your assets are still on-chain — but without the private key, you cannot sign transactions.',
          },
          {
            icon: MdOutlineBackup,
            className: 'text-green-400',
            text: "Save your private key or Recovery Phrase before removing — it's the only way to recover this address.",
          },
        ]}
      />
    </div>
  );
}
