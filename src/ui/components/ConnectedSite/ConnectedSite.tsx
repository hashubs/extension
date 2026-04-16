import DisconnectIcon from 'jsx:src/ui/assets/disconnect.svg';
import { CgArrowTopLeft } from 'react-icons/cg';
import { CiGlobe } from 'react-icons/ci';
import { prepareForHref } from '@/shared/prepare-for-href';
import { getPermissionsWithWallets } from '@/shared/request/internal/getPermissionsWithWallets';
import { BlockieAddress } from '@/ui/components/blockie';
import { WalletDisplayName } from '@/ui/components/wallet';
import { truncateAddress } from '@/ui/lib/utils';
import { Button } from '@/ui/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getNameFromOrigin } from 'src/shared/dapps';
import { invariant } from 'src/shared/invariant';
import { getConnectedSite } from '../../../shared/getConnectedSite';
import { useRemovePermissionMutation } from '../../hooks/request/internal/useRemovePermission';
import { MetamaskMode } from './MetamaskMode';

import { Header } from 'src/ui/components/header';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from 'src/ui/ui-kit/drawer';

function RevokeAllButton({
  origin,
  onSuccess,
}: {
  origin: string;
  onSuccess: () => void;
}) {
  const removePermissionMutation = useRemovePermissionMutation({ onSuccess });
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="pb-8">
          <DrawerHeader>
            <DrawerTitle className="text-xl font-bold">
              Disconnect All Addresses?
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-6 py-2 text-center text-neutral-500 text-base">
            Situs ini akan kehilangan akses ke semua alamat Anda sampai Anda
            menghubungkannya kembali.
          </div>
          <DrawerFooter className="flex flex-row gap-3 pt-6">
            <DrawerClose asChild>
              <Button
                size="md"
                variant="secondary"
                className="flex-1 rounded-2xl py-6 font-semibold"
              >
                Batal
              </Button>
            </DrawerClose>
            <Button
              size="md"
              variant="danger"
              className="flex-1 rounded-2xl py-6 font-semibold shadow-lg shadow-danger/20"
              onClick={() => {
                removePermissionMutation.mutate({ origin });
                setIsOpen(false);
              }}
            >
              {removePermissionMutation.isPending ? 'Memuat...' : 'Putuskan'}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <Button
        size="md"
        variant="danger"
        className="w-full py-7 rounded-2xl font-bold text-base shadow-lg shadow-danger/10 hover:shadow-danger/20 transition-all duration-300"
        onClick={() => setIsOpen(true)}
      >
        {removePermissionMutation.isPending
          ? 'Memuat...'
          : 'Putuskan Semua Alamat'}
      </Button>
    </>
  );
}

function SiteLink({ title, href }: { title: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-row items-center justify-between p-4 bg-primary/5 hover:bg-primary/10 rounded-2xl border border-primary/10 hover:border-primary/20 transition-all duration-300 no-underline"
    >
      <div className="flex flex-row items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-background border border-border/50 shadow-sm text-foreground/70">
          <CiGlobe className="size-6" />
        </div>
        <div className="flex flex-col gap-0.5 text-start">
          <div className="text-[16px] font-bold leading-tight tracking-tight uppercase text-foreground/90">
            {title}
          </div>
          <div className="text-[12px] text-neutral-500 font-medium">
            Buka Situs Dapp
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center size-8 rounded-lg bg-background/50 group-hover:bg-background transition-colors shadow-sm">
        <CgArrowTopLeft className="block size-3.5 text-neutral-400 group-hover:text-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </a>
  );
}

export function ConnectedSite() {
  const { originName } = useParams();
  invariant(originName, 'originName parameter is required for this view');
  const { data: connectedSites, refetch } = useQuery({
    queryKey: ['getPermissionsWithWallets'],
    queryFn: getPermissionsWithWallets,
  });
  const connectedSite = useMemo(
    () => getConnectedSite(originName, connectedSites),
    [connectedSites, originName]
  );
  const siteOrigin = connectedSite?.origin;
  const connectedSiteOriginForHref = useMemo(
    () => (siteOrigin ? prepareForHref(siteOrigin) : null),
    [siteOrigin]
  );
  const navigate = useNavigate();
  const handleAllRemoveSuccess = useCallback(() => {
    refetch();
    navigate(-1);
  }, [navigate, refetch]);

  const [confirmAddress, setConfirmAddress] = useState<string | null>(null);

  const removePermissionMutation = useRemovePermissionMutation({
    onSuccess: () => {
      refetch();
      if (connectedSite?.addresses.length === 1) {
        navigate(-1);
      }
    },
  });
  if (!connectedSite) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-8 text-center bg-background">
        <div className="size-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
          <CiGlobe className="size-10 text-neutral-400 opacity-50" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Situs Tidak Ditemukan</h1>
        <p className="text-neutral-500 mb-8 max-w-[240px]">
          Maaf, data situs yang Anda cari tidak tersedia atau sudah terputus.
        </p>
        <Button
          variant="secondary"
          className="w-full max-w-[200px] py-6 rounded-2xl font-bold"
          onClick={() => navigate(-1)}
        >
          Kembali
        </Button>
      </div>
    );
  }

  const title = getNameFromOrigin(connectedSite.origin);
  return (
    <div className="flex flex-col h-screen bg-background">
      <Drawer
        open={confirmAddress !== null}
        onOpenChange={(open: boolean) => !open && setConfirmAddress(null)}
      >
        <DrawerContent className="pb-8">
          <DrawerHeader>
            <DrawerTitle className="text-xl font-bold">
              Putuskan Alamat?
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-6 py-2 text-center text-neutral-500 text-base">
            Apakah Anda yakin ingin memutuskan alamat ini dari situs?
          </div>
          <DrawerFooter className="flex flex-row gap-3 pt-6">
            <DrawerClose asChild>
              <Button
                size="md"
                variant="secondary"
                className="flex-1 rounded-2xl py-6 font-semibold"
              >
                Kembali
              </Button>
            </DrawerClose>
            <Button
              size="md"
              variant="danger"
              className="flex-1 rounded-2xl py-6 font-semibold shadow-lg shadow-danger/20"
              onClick={() => {
                if (confirmAddress) {
                  removePermissionMutation.mutate({
                    origin: connectedSite.origin,
                    address: confirmAddress,
                  });
                }
                setConfirmAddress(null);
              }}
            >
              {removePermissionMutation.isPending ? 'Memuat...' : 'Putuskan'}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Header title={title} onBack={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <h2 className="px-1 text-xs font-bold uppercase tracking-wider text-neutral-400">
            Ikhtisar Dapp
          </h2>
          <div className="flex flex-col gap-2">
            {connectedSiteOriginForHref && (
              <SiteLink title={title} href={connectedSiteOriginForHref.href} />
            )}
            <div className="p-4 bg-muted/10 rounded-2xl border border-border/50 hover:bg-muted/20 transition-colors">
              <MetamaskMode originName={originName} />
            </div>
          </div>
        </section>

        {connectedSite.wallets.length ? (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Alamat Terhubung
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-muted rounded-full text-neutral-500">
                {connectedSite.wallets.length} TOTAL
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {connectedSite.wallets.map((wallet) => (
                <div
                  key={wallet.address}
                  className="group relative flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/30 rounded-2xl border border-border/50 transition-all duration-300"
                >
                  <div className="flex flex-row items-center gap-4">
                    <div className="relative">
                      <BlockieAddress
                        address={wallet.address}
                        size={48}
                        borderRadius={14}
                      />
                      <div className="absolute -bottom-1 -right-1 size-4 bg-green-500 border-2 border-background rounded-full shadow-sm" />
                    </div>
                    <div className="flex flex-col gap-0.5 text-start">
                      <div className="text-[17px] font-bold leading-tight tracking-tight">
                        <WalletDisplayName wallet={wallet} />
                      </div>
                      {wallet.name ? (
                        <div className="text-[12px] text-neutral-500 font-medium font-mono">
                          {truncateAddress(wallet.address)}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <Button
                    size="md"
                    variant="danger"
                    className="size-11 p-0 rounded-xl bg-danger/5 hover:bg-danger text-danger hover:text-white border-none shadow-none transition-all duration-300 flex items-center justify-center"
                    aria-label="disconnect address"
                    onClick={() => setConfirmAddress(wallet.address)}
                  >
                    <DisconnectIcon className="size-5" />
                  </Button>
                </div>
              ))}
            </div>

            {connectedSite.wallets.length > 1 && (
              <div className="mt-4 pb-8">
                <RevokeAllButton
                  origin={connectedSite.origin}
                  onSuccess={handleAllRemoveSuccess}
                />
              </div>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}
