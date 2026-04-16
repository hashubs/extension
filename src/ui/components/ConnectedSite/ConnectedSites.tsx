import { walletPort } from '@/shared/channel';
import {
  ConnectedSiteItem,
  getPermissionsWithWallets,
} from '@/shared/request/internal/getPermissionsWithWallets';
import { Button } from '@/ui/ui-kit';
import { DebouncedInput, InputHandle } from '@/ui/ui-kit/input/debounced-input';
import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useMemo, useRef, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { SiteFaviconImg } from 'src/ui/components/SiteFaviconImg';
import { ConnectedSite } from './ConnectedSite';

import ChevronRightIcon from 'jsx:src/ui/assets/chevron-right.svg';

import { truncateAddress } from '@/ui/lib/utils';
import SearchIcon from 'jsx:src/ui/assets/search.svg';
import { Link } from 'react-router-dom';
import { Header } from 'src/ui/components/header';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from 'src/ui/ui-kit/drawer';

function RevokeAllPermissionsComponent({
  onRevokeAll,
}: {
  onRevokeAll: () => void;
}) {
  const removeAllOriginsMutation = useMutation({
    mutationFn: () => walletPort.request('removeAllOriginPermissions'),
    onSuccess: onRevokeAll,
  });
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="pb-8">
          <DrawerHeader>
            <DrawerTitle className="text-xl font-bold">
              Putuskan Semua Situs?
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-6 py-2 text-center text-neutral-500 text-base">
            Semua situs yang terhubung tidak akan lagi melihat alamat Anda,
            tetapi mereka dapat meminta akses kembali nanti.
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
                removeAllOriginsMutation.mutate();
                setIsOpen(false);
              }}
            >
              {removeAllOriginsMutation.isPending
                ? 'Memuat...'
                : 'Putuskan Semua'}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full p-4 mt-2 text-center text-danger hover:bg-danger/10 rounded-2xl bg-danger/5 border border-danger/10 transition-all font-semibold"
      >
        {removeAllOriginsMutation.isPending
          ? 'Memuat...'
          : 'Putuskan Semua Koneksi'}
      </button>
    </>
  );
}

function ConnectedSitesList({
  showRevokeAll,
  items,
  onRevokeAll,
}: {
  showRevokeAll: boolean;
  items: ConnectedSiteItem[];
  onRevokeAll: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const hostname = new URL(item.origin).hostname;
          return (
            <Link
              key={item.origin}
              to={`/connected-sites/${encodeURIComponent(item.origin)}`}
              className="group flex flex-row items-center justify-between p-4 bg-muted/20 hover:bg-muted/30 border border-border/50 hover:border-border rounded-2xl transition-all duration-300 no-underline"
            >
              <div className="flex flex-row items-center gap-3">
                <div className="size-10 rounded-xl bg-background border border-border/50 shadow-sm flex items-center justify-center overflow-hidden">
                  <SiteFaviconImg
                    size={24}
                    url={item.origin}
                    alt={`Logo for ${item.origin}`}
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="text-[16px] font-bold leading-tight text-foreground/90">
                    {hostname}
                  </div>
                  <div className="flex flex-row gap-1 items-center overflow-hidden">
                    {item.wallets.slice(0, 2).map((wallet) => (
                      <div
                        key={wallet.address}
                        className="px-2 py-0.5 bg-background/50 border border-border/40 rounded-full text-[10px] font-bold text-neutral-500"
                      >
                        {wallet.name || truncateAddress(wallet.address)}
                      </div>
                    ))}
                    {item.wallets.length > 2 && (
                      <span className="text-[10px] font-bold text-neutral-400">
                        +{item.wallets.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRightIcon className="size-5 text-neutral-300 group-hover:text-foreground group-hover:translate-x-1 transition-all" />
            </Link>
          );
        })}
      </div>
      {showRevokeAll ? (
        <RevokeAllPermissionsComponent onRevokeAll={onRevokeAll} />
      ) : null}
    </div>
  );
}

function ConnectedSitesSearch({
  value,
  onChange,
  inputRef,
}: {
  value: string;
  onChange(value: string): void;
  inputRef: React.MutableRefObject<InputHandle | null>;
}) {
  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors">
        <SearchIcon className="size-5" />
      </div>
      <DebouncedInput
        ref={inputRef}
        value={value}
        delay={300}
        onChange={onChange}
        render={({ value, handleChange }) => (
          <input
            type="text"
            className="w-full h-12 pl-12 pr-4 bg-muted/10 border-2 border-border/30 focus:border-primary/50 focus:bg-background rounded-2xl outline-none transition-all placeholder:text-neutral-400 font-medium"
            placeholder="Cari situs..."
            value={value}
            onChange={(event) => {
              handleChange(event.currentTarget.value);
            }}
          />
        )}
      />
    </div>
  );
}

function EmptyState({
  hasConnectedSites,
  hasFilters,
  onReset,
}: {
  hasConnectedSites: boolean;
  hasFilters: boolean;
  onReset(): void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
      <div className="size-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl">🥺</span>
      </div>
      {hasConnectedSites ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-bold">Tidak ada DApps yang ditemukan</h3>
          <p className="text-neutral-500 mb-6">
            Mungkin kata sandi pencarian Anda tidak cocok dengan situs mana pun.
          </p>
          {hasFilters && (
            <button
              onClick={onReset}
              className="text-primary font-bold hover:underline"
            >
              Reset semua filter
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-bold">Belum Ada Koneksi</h3>
          <p className="text-neutral-500 max-w-[240px]">
            Anda akan melihat daftar DApps yang terhubung di sini setelah
            melakukan koneksi pertama.
          </p>
        </div>
      )}
    </div>
  );
}

function ConnectedSitesMain() {
  const {
    data: allConnectedSites,
    isLoading,
    ...connectedSitesQuery
  } = useQuery({
    queryKey: ['getPermissionsWithWallets'],
    queryFn: getPermissionsWithWallets,
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const searchInputRef = useRef<InputHandle | null>(null);

  const itemsToDisplay = useMemo(() => {
    if (!searchQuery) {
      return allConnectedSites;
    }
    const query = searchQuery.trim();
    return allConnectedSites?.filter((site) =>
      site.origin.toLowerCase().includes(query.toLowerCase())
    );
  }, [allConnectedSites, searchQuery]);

  return (
    <div className="flex flex-col min-h-screen bg-background lowercase">
      <Header title="Connected DApps" onBack={() => {}} />

      <div className="flex-1 flex flex-col gap-6 px-4 py-6 overflow-y-auto">
        {allConnectedSites?.length ? (
          <ConnectedSitesSearch
            inputRef={searchInputRef}
            value={searchQuery}
            onChange={setSearchQuery}
          />
        ) : null}

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="size-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : itemsToDisplay?.length ? (
          <ConnectedSitesList
            showRevokeAll={!searchQuery}
            items={itemsToDisplay}
            onRevokeAll={() => connectedSitesQuery.refetch()}
          />
        ) : (
          <EmptyState
            hasConnectedSites={Boolean(allConnectedSites?.length)}
            hasFilters={Boolean(searchQuery)}
            onReset={() => {
              if (searchInputRef.current) {
                searchInputRef.current.setValue('');
              }
              setSearchQuery('');
            }}
          />
        )}
      </div>
    </div>
  );
}

export function ConnectedSites() {
  return (
    <Routes>
      <Route path="/" element={<ConnectedSitesMain />} />
      <Route path="/:originName" element={<ConnectedSite />} />
    </Routes>
  );
}
