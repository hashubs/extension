import { walletPort } from '@/shared/channels';
import { invariant } from '@/shared/invariant';
import { queryClient } from '@/shared/query-client/queryClient';
import { useToastStore } from '@/shared/store/useToastStore';
import { ExternallyOwnedAccount } from '@/shared/types/externally-owned-account';
import {
  ContainerType,
  getContainerType,
  isBareWallet,
  isDeviceAccount,
} from '@/shared/types/validators';
import { formatFiatToParts } from '@/shared/units/format-fiat';
import { BlockieAddress } from '@/ui/components/blockie';
import { ConfirmationSheet } from '@/ui/components/confirmation';
import { Layout } from '@/ui/components/layout';
import { useProfileName } from '@/ui/hooks/request/internal/useProfileName';
import {
  QUERY_WALLET,
  useWalletByAddress,
  useWalletGroupByGroupId,
  useWalletGroups,
} from '@/ui/hooks/request/internal/useWallet';
import { useCopyToClipboard } from '@/ui/hooks/useCopyToClipboard';
import { useDebouncedCallback } from '@/ui/hooks/useDebouncedCallback';
import { useFiatConversion } from '@/ui/hooks/useFiatConversion';
import { truncateAddress } from '@/ui/lib/utils';
import { NeutralDecimals } from '@/ui/ui-kit';
import { Card, CardItem, ItemType } from '@/ui/ui-kit/card';
import { InputDecorator } from '@/ui/ui-kit/input/Input-decorator';
import { REVEAL_PK_ROUTES } from '@/ui/views/reveal-private-key';
import { useMutation } from '@tanstack/react-query';
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
  placeholder,
  onRename,
}: {
  id: string;
  wallet: ExternallyOwnedAccount | null;
  placeholder?: string;
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
          placeholder={placeholder || truncateAddress(wallet?.address || '')}
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

  const { show: showToast } = useToastStore();
  const [openConfirm, setOpenConfirm] = useState(false);

  const { data: wallet, refetch: refetchWallet } = useWalletByAddress({
    address,
    groupId,
  });

  const { data: walletGroupByGroupId } = useWalletGroupByGroupId({
    groupId,
  });

  const walletName = wallet?.name || null;

  const { value: displayName } = useProfileName({ address, name: walletName });

  const { data: walletGroups } = useWalletGroups();

  const removeAddressMutation = useMutation({
    mutationFn: () => walletPort.request('removeAddress', { address, groupId }),
    onSuccess() {
      refetchWallet();
      const containerType = walletGroupByGroupId
        ? getContainerType(walletGroupByGroupId.walletContainer)
        : null;
      const isFlat =
        containerType === ContainerType.readonly ||
        containerType === ContainerType.privateKey;

      const backUrl = isFlat
        ? '/settings/manage-wallets'
        : `/settings/manage-wallets/groups/${groupId}`;

      navigate(backUrl, {
        state: { direction: 'back' },
      });
      showToast('Remove wallet address successfully');
      queryClient.invalidateQueries({
        queryKey: QUERY_WALLET.walletGroups,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_WALLET.walletGroup(groupId),
      });
    },
  });

  const nameInputId = useId();

  const handleRemoveAddress = async () => {
    await removeAddressMutation.mutateAsync();
    setOpenConfirm(false);
  };

  const containerType = walletGroupByGroupId
    ? getContainerType(walletGroupByGroupId.walletContainer)
    : null;

  const isFlat =
    containerType === ContainerType.readonly ||
    containerType === ContainerType.privateKey;

  const totalWalletsGlobal =
    walletGroups?.reduce(
      (total: number, group: any) =>
        total + group.walletContainer.wallets.length,
      0
    ) || 0;

  const disableRemove =
    ((containerType === ContainerType.mnemonic ||
      containerType === ContainerType.hardware) &&
      walletGroupByGroupId?.walletContainer.wallets.length === 1) ||
    totalWalletsGlobal === 1;

  const items: ItemType[] = [
    wallet && isBareWallet(wallet)
      ? {
          label: 'Export Private Key',
          icon: LuKey,
          iconRight: LuChevronRight,
          onClick: () => {
            navigate(
              `${REVEAL_PK_ROUTES.ROOT}?groupId=${groupId}&address=${address}`,
              {
                state: { direction: 'forward' },
              }
            );
          },
        }
      : null,
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
  ].filter(Boolean) as ItemType[];

  return (
    <>
      <Layout
        title={displayName}
        onBack={() => {
          const backUrl = isFlat
            ? '/settings/manage-wallets'
            : `/settings/manage-wallets/groups/${groupId}`;

          navigate(backUrl, {
            state: {
              direction: 'back',
              openGroupId: isFlat ? groupId : undefined,
            },
          });
        }}
      >
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
              ) : isFlat ? (
                <span className="text-xs text-muted-foreground">
                  {containerType === ContainerType.readonly
                    ? 'Read-only wallet'
                    : 'Private key wallet'}
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
              placeholder={displayName}
              onRename={refetchWallet}
            />
          }
        />

        <Card>
          {items.map((item, i) => (
            <CardItem key={i} item={item} />
          ))}
        </Card>
      </Layout>

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
    </>
  );
}
