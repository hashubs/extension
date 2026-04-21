import { getConnectedSite } from '@/shared/getConnectedSite';
import { normalizeAddress } from '@/shared/normalize-address';
import { queryClient } from '@/shared/query-client/queryClient';
import { getPermissionsWithWallets } from '@/shared/request/internal/getPermissionsWithWallets';
import { ExternallyOwnedAccount } from '@/shared/types/externally-owned-account';
import { MetamaskMode } from '@/ui/components/ConnectedSite/MetamaskMode';
import { SiteFaviconImg } from '@/ui/components/SiteFaviconImg';
import { useRemovePermissionMutation } from '@/ui/hooks/request/internal/useRemovePermission';
import { getCurrentWallet } from '@/ui/hooks/request/internal/useWallet';
import { cn } from '@/ui/lib/utils';
import { Button, Drawer, DrawerContent, DrawerTrigger } from '@/ui/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { BsGlobe } from 'react-icons/bs';
import { FaArrowRight } from 'react-icons/fa';
import { RiListSettingsLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { getNameFromOrigin } from 'src/shared/dapps';
import { invariant } from 'src/shared/invariant';

export function ConnectedSiteDrawer({
  originName,
}: {
  originName: string | null;
}) {
  const navigate = useNavigate();
  invariant(originName, 'originName parameter is required for this view');

  const [open, setOpen] = useState(false);

  const { data: connectedSites, refetch } = useQuery({
    queryKey: ['getPermissionsWithWallets'],
    queryFn: getPermissionsWithWallets,
  });
  const connectedSite = useMemo(
    () => getConnectedSite(originName, connectedSites),
    [connectedSites, originName]
  );
  const siteOrigin = connectedSite?.origin;
  const siteHostname = siteOrigin ? new URL(siteOrigin).hostname : null;

  const { data: currentWallet } = getCurrentWallet();

  const currentAddress = currentWallet?.address;
  const currentWalletIsConnected = useMemo(
    () =>
      currentAddress
        ? connectedSite?.addresses.some(
            (address) =>
              normalizeAddress(address) === normalizeAddress(currentAddress)
          )
        : false,
    [connectedSite?.addresses, currentAddress]
  );

  const onDismiss = () => {
    setOpen(false);
  };

  const handleToAllConnections = () => {
    onDismiss();
    navigate('/connected-sites');
  };

  if (!connectedSite) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="size-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
          <BsGlobe className="size-8 opacity-50 rotate-180" />
        </div>
        <h3 className="text-lg font-bold mb-1">Site not found</h3>
        <p className="text-sm text-muted-foreground/80">
          This site is no longer connected to your wallet.
        </p>
      </div>
    );
  }
  const title = getNameFromOrigin(connectedSite.origin);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          iconOnly
          iconOnlySize="md"
          variant="outline"
          icon={RiListSettingsLine}
          className="rounded-md"
        />
      </DrawerTrigger>
      <DrawerContent
        variant="inset"
        title="Connected Site"
        description="Connected Site"
        className="max-w-[400px]"
      >
        <div className="flex flex-col items-center w-full px-4 mx-auto">
          <div className="text-center mb-5">
            <span className="font-medium mb-1 text-muted-foreground text-[10px] uppercase tracking-wider">
              Site Connection
            </span>
            <div className="flex items-center justify-center gap-2">
              <SiteFaviconImg size={18} url={siteOrigin!} />
              <p className="font-semibold text-base">{siteHostname}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-5 w-full">
            <div className="flex-1 h-px bg-muted-foreground/20" />
            <div className="rounded-full bg-muted-foreground/20 size-1.25" />
            <div className="flex-1 h-px bg-muted-foreground/20" />
          </div>

          <MetamaskMode
            originName={originName}
            onCheckedChange={() => setTimeout(onDismiss, 300)}
          />

          <div
            className={cn(
              'grid w-full gap-2 py-4',
              currentWalletIsConnected ? 'grid-cols-[1fr_auto]' : 'grid-cols-1'
            )}
          >
            {currentWalletIsConnected ? (
              <DisconnectFromDappButton
                wallet={currentWallet!}
                origin={connectedSite.origin}
                originTitle={title}
                onSuccess={() => {
                  refetch();
                  onDismiss();
                }}
              />
            ) : null}
            <Button
              size="md"
              variant="outline"
              icon={FaArrowRight}
              iconPosition="right"
              onClick={handleToAllConnections}
              className="whitespace-nowrap"
            >
              All Connections
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function DisconnectFromDappButton({
  wallet,
  origin,
  onSuccess,
}: {
  origin: string;
  originTitle: string;
  wallet: ExternallyOwnedAccount;
  onSuccess?: () => void;
}) {
  const normalizedAddress = normalizeAddress(wallet.address);
  const removePermissionMutation = useRemovePermissionMutation({
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: ['isAccountAvailableToOrigin', normalizedAddress, origin],
      });
      onSuccess?.();
    },
  });

  return (
    <Button
      size="md"
      variant="danger"
      onClick={() => {
        removePermissionMutation.mutate({
          address: normalizedAddress,
          origin,
        });
      }}
      disabled={removePermissionMutation.isPending}
    >
      {removePermissionMutation.isPending ? 'Disconnecting…' : 'Disconnect'}
    </Button>
  );
}
