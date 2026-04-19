import { getNameFromOrigin } from '@/shared/dapps';
import { getConnectedSite } from '@/shared/getConnectedSite';
import { invariant } from '@/shared/invariant';
import { prepareForHref } from '@/shared/prepare-for-href';
import { getPermissionsWithWallets } from '@/shared/request/internal/getPermissionsWithWallets';
import { ExternallyOwnedAccount } from '@/shared/types/externally-owned-account';
import { BlockieAddress } from '@/ui/components/blockie';
import { MetamaskMode } from '@/ui/components/ConnectedSite/MetamaskMode';
import { Header } from '@/ui/components/header';
import { WalletDisplayName } from '@/ui/components/wallet';
import { useRemovePermissionMutation } from '@/ui/hooks/request/internal/useRemovePermission';
import { truncateAddress } from '@/ui/lib/utils';
import { Button } from '@/ui/ui-kit';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
} from '@/ui/ui-kit/drawer';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { AiOutlineDisconnect } from 'react-icons/ai';
import { LuArrowUpRight, LuGlobe, LuWifi } from 'react-icons/lu';
import { useNavigate, useParams } from 'react-router-dom';

function ConfirmDrawer({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  isPending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange(v: boolean): void;
  title: string;
  description: string;
  confirmLabel: string;
  isPending: boolean;
  onConfirm(): void;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent variant="inset" title={title}>
        <div className="px-4 pb-4 pt-2">
          <h2 className="text-base font-medium text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
        <DrawerFooter className="flex flex-row gap-2 pt-2">
          <DrawerClose asChild>
            <Button size="md" variant="secondary">
              Cancel
            </Button>
          </DrawerClose>
          <Button
            size="md"
            variant="danger"
            disabled={isPending}
            loading={isPending}
            onClick={onConfirm}
            loadingText="Disconnecting…"
          >
            {confirmLabel}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function SiteLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 px-3 py-3 hover:bg-muted/30 border border-border/50 hover:border-border rounded-xl transition-all duration-150 no-underline"
    >
      <div className="size-9 rounded-lg flex items-center justify-center shrink-0 bg-muted/20 border border-border/40">
        <LuGlobe className="size-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{label}</p>
        <p className="text-xs text-muted-foreground">Open DApp site</p>
      </div>
      <LuArrowUpRight className="size-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150 shrink-0" />
    </a>
  );
}

function WalletRow({
  wallet,
  onDisconnect,
}: {
  wallet: ExternallyOwnedAccount | null | undefined;
  onDisconnect(): void;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-3 border border-border/50 rounded-xl transition-colors duration-150">
      <div className="relative shrink-0">
        <BlockieAddress
          address={wallet?.address || ''}
          size={36}
          borderRadius={10}
        />
        <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-green-500 border-2 border-background" />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm font-medium text-foreground leading-tight">
          <WalletDisplayName wallet={wallet} />
        </span>
        {wallet?.name && (
          <span className="text-[11px] text-muted-foreground font-mono mt-0.5">
            {truncateAddress(wallet?.address)}
          </span>
        )}
      </div>

      <Button
        iconOnly
        iconOnlySize="sm"
        variant="danger"
        onClick={onDisconnect}
        aria-label="Disconnect address"
        icon={AiOutlineDisconnect}
      />
    </div>
  );
}

function SectionLabel({
  children,
  badge,
}: {
  children: React.ReactNode;
  badge?: number;
}) {
  return (
    <div className="flex items-center justify-between ml-1 mb-2!">
      <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
        {children}
      </h2>
      {badge && (
        <span className="text-[10px] font-medium px-2 py-0.5 bg-muted/50 text-muted-foreground border border-border/30 rounded-full">
          {badge}
        </span>
      )}
    </div>
  );
}

export function ConnectedSiteView() {
  const { originName } = useParams();
  invariant(originName, 'originName parameter is required for this view');

  const navigate = useNavigate();

  const { data: connectedSites, refetch } = useQuery({
    queryKey: ['getPermissionsWithWallets'],
    queryFn: getPermissionsWithWallets,
  });

  const connectedSite = useMemo(
    () => getConnectedSite(originName, connectedSites),
    [connectedSites, originName]
  );

  const siteHref = useMemo(
    () => (connectedSite?.origin ? prepareForHref(connectedSite.origin) : null),
    [connectedSite?.origin]
  );

  const [confirmAddress, setConfirmAddress] = useState<string | null>(null);

  const singleRemoveMutation = useRemovePermissionMutation({
    onSuccess: () => {
      refetch();
      if (connectedSite?.addresses.length === 1) navigate(-1);
    },
  });

  const [confirmAll, setConfirmAll] = useState(false);

  const allRemoveMutation = useRemovePermissionMutation({
    onSuccess: () => {
      refetch();
      navigate(-1);
    },
  });

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  if (!connectedSite) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-8 text-center bg-background">
        <div className="size-12 rounded-full bg-muted/30 flex items-center justify-center">
          <LuWifi className="size-5 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium text-foreground">Site not found</p>
        <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
          This site's data is unavailable or has already been disconnected.
        </p>
        <Button
          variant="secondary"
          className="mt-2 px-6 py-4 rounded-xl text-sm font-medium"
          onClick={handleBack}
        >
          Go back
        </Button>
      </div>
    );
  }

  const title = getNameFromOrigin(connectedSite.origin);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <ConfirmDrawer
        open={confirmAddress !== null}
        onOpenChange={(open) => !open && setConfirmAddress(null)}
        title="Disconnect address?"
        description="This address will lose access to the site. You can reconnect it at any time."
        confirmLabel="Disconnect"
        isPending={singleRemoveMutation.isPending}
        onConfirm={() => {
          if (confirmAddress) {
            singleRemoveMutation.mutate({
              origin: connectedSite.origin,
              address: confirmAddress,
            });
          }
          setConfirmAddress(null);
        }}
      />

      <ConfirmDrawer
        open={confirmAll}
        onOpenChange={setConfirmAll}
        title="Disconnect all addresses?"
        description="This site will lose access to all your addresses until you reconnect."
        confirmLabel="Disconnect all"
        isPending={allRemoveMutation.isPending}
        onConfirm={() => {
          allRemoveMutation.mutate({ origin: connectedSite.origin });
          setConfirmAll(false);
        }}
      />

      <Header title={title} onBack={handleBack} />

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">
        <section className="flex flex-col gap-2">
          <SectionLabel>DApp overview</SectionLabel>

          {siteHref && <SiteLink label={title} href={siteHref.href} />}

          <MetamaskMode originName={originName} />
        </section>

        {connectedSite.wallets.length > 0 && (
          <section className="flex flex-col gap-2">
            <SectionLabel badge={connectedSite.wallets.length}>
              Connected addresses
            </SectionLabel>

            <div className="flex flex-col gap-1.5">
              {connectedSite.wallets.map((wallet) => (
                <WalletRow
                  key={wallet.address}
                  wallet={wallet}
                  onDisconnect={() => setConfirmAddress(wallet.address)}
                />
              ))}
            </div>

            {/* disconnect all — only visible when 2+ wallets */}
            {connectedSite.wallets.length > 1 && (
              <button
                onClick={() => setConfirmAll(true)}
                className="
                  mt-1 w-full py-3 rounded-xl
                  border border-danger/20 bg-danger/5
                  text-sm font-medium text-danger
                  hover:bg-danger/10 hover:border-danger/30
                  transition-colors duration-150
                "
              >
                {allRemoveMutation.isPending
                  ? 'Disconnecting…'
                  : 'Disconnect all addresses'}
              </button>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
