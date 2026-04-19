import { walletPort } from '@/shared/channel';
import {
  ConnectedSiteItem,
  getPermissionsWithWallets,
} from '@/shared/request/internal/getPermissionsWithWallets';
import { Header } from '@/ui/components/header';
import { SiteFaviconImg } from '@/ui/components/SiteFaviconImg';
import { truncateAddress } from '@/ui/lib/utils';
import { Button, Input } from '@/ui/ui-kit';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from '@/ui/ui-kit/drawer';
import { DebouncedInput, InputHandle } from '@/ui/ui-kit/input/debounced-input';
import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useMemo, useRef, useState } from 'react';
import { LuChevronRight, LuSearch, LuWifi } from 'react-icons/lu';
import { Link, useNavigate } from 'react-router-dom';

function DisconnectAllDrawer({ onRevokeAll }: { onRevokeAll: () => void }) {
  const removeAllMutation = useMutation({
    mutationFn: () => walletPort.request('removeAllOriginPermissions'),
    onSuccess: onRevokeAll,
  });

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          size="md"
          variant="danger"
          disabled={removeAllMutation.isPending}
          loading={removeAllMutation.isPending}
          loadingText="Disconnecting…"
        >
          Disconnect all
        </Button>
      </DrawerTrigger>

      <DrawerContent variant="inset" title="Disconnect all sites?">
        <div className="px-4 pb-4 pt-2">
          <h2 className="text-base font-medium text-foreground">
            Disconnect all sites?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All connected sites will lose access to your addresses. They can
            request access again at any time.
          </p>
        </div>
        <DrawerFooter className="flex flex-row gap-2">
          <DrawerClose asChild>
            <Button size="md" variant="secondary">
              Cancel
            </Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button
              size="md"
              variant="danger"
              onClick={() => {
                removeAllMutation.mutate();
              }}
            >
              {removeAllMutation.isPending
                ? 'Disconnecting…'
                : 'Disconnect all'}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function SiteRow({ item }: { item: ConnectedSiteItem }) {
  const hostname = new URL(item.origin).hostname;

  return (
    <Link
      to={`/settings/connected-sites/${encodeURIComponent(item.origin)}`}
      className="group flex items-center gap-3 px-3 py-3 bg-background hover:bg-muted/40 border border-border/50 hover:border-border rounded-xl transition-all duration-150 no-underline"
    >
      <SiteFaviconImg
        size={36}
        url={item.origin}
        alt={`${hostname} icon`}
        className="rounded-lg"
      />

      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-sm font-medium text-foreground truncate">
          {hostname}
        </span>
        <div className="flex items-center gap-1 overflow-hidden">
          {item.wallets.slice(0, 2).map((w) => (
            <span
              key={w.address}
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground border border-border/30 truncate max-w-[80px]"
            >
              {w.name || truncateAddress(w.address)}
            </span>
          ))}
          {item.wallets.length > 2 && (
            <span className="text-[10px] text-muted-foreground font-medium">
              +{item.wallets.length - 2}
            </span>
          )}
        </div>
      </div>

      <LuChevronRight className="size-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-150 shrink-0" />
    </Link>
  );
}

function ConnectedSitesList({
  items,
  showDisconnectAll,
  onRevokeAll,
}: {
  items: ConnectedSiteItem[];
  showDisconnectAll: boolean;
  onRevokeAll: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <SiteRow key={item.origin} item={item} />
      ))}

      {showDisconnectAll && (
        <div className="pt-2">
          <DisconnectAllDrawer onRevokeAll={onRevokeAll} />
        </div>
      )}
    </div>
  );
}

function SearchBar({
  value,
  onChange,
  inputRef,
}: {
  value: string;
  onChange(v: string): void;
  inputRef: React.MutableRefObject<InputHandle | null>;
}) {
  return (
    <DebouncedInput
      ref={inputRef}
      value={value}
      delay={250}
      onChange={onChange}
      render={({ value, handleChange }) => (
        <Input
          type="text"
          placeholder="Search sites…"
          value={value}
          onChange={(e) => handleChange(e.currentTarget.value)}
          leftIcon={LuSearch}
        />
      )}
    />
  );
}

function EmptyState({
  hasConnectedSites,
  hasQuery,
  onReset,
}: {
  hasConnectedSites: boolean;
  hasQuery: boolean;
  onReset(): void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="size-12 rounded-full bg-muted/30 flex items-center justify-center">
        <LuWifi className="size-5 text-muted-foreground/50" />
      </div>

      {hasConnectedSites ? (
        <>
          <p className="text-sm font-medium text-foreground">No results</p>
          <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
            No sites match your search.
          </p>
          {hasQuery && (
            <button
              onClick={onReset}
              className="text-xs font-medium text-primary hover:underline mt-1"
            >
              Clear search
            </button>
          )}
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-foreground">
            No connections yet
          </p>
          <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
            Connected DApps will appear here after your first connection.
          </p>
        </>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-3 py-3 border border-border/30 rounded-xl"
        >
          <div className="size-9 rounded-lg bg-muted/40 animate-pulse shrink-0" />
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="h-3 w-28 rounded bg-muted/40 animate-pulse" />
            <div className="h-2.5 w-16 rounded bg-muted/30 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ConnectedSitesView() {
  const navigate = useNavigate();

  const {
    data: allSites,
    isLoading,
    ...query
  } = useQuery({
    queryKey: ['getPermissionsWithWallets'],
    queryFn: getPermissionsWithWallets,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<InputHandle | null>(null);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return allSites;
    const q = searchQuery.toLowerCase().trim();
    return allSites?.filter((s) => s.origin.toLowerCase().includes(q));
  }, [allSites, searchQuery]);

  const siteCount = allSites?.length ?? 0;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <Header
        title="Connected DApps"
        onBack={() => navigate('/settings', { state: { direction: 'back' } })}
      />

      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto px-4 pb-4 space-y-4">
        {siteCount > 0 && (
          <SearchBar
            inputRef={searchInputRef}
            value={searchQuery}
            onChange={setSearchQuery}
          />
        )}

        {siteCount > 0 && !searchQuery && (
          <div className="flex items-center justify-between ml-1 mb-2!">
            <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              Active connections
            </h2>
            <span className="text-[10px] font-medium px-2 py-0.5 bg-muted/50 text-muted-foreground border border-border/30 rounded-full">
              {siteCount}
            </span>
          </div>
        )}

        {isLoading ? (
          <LoadingSkeleton />
        ) : filtered?.length ? (
          <ConnectedSitesList
            items={filtered}
            showDisconnectAll={!searchQuery}
            onRevokeAll={() => query.refetch()}
          />
        ) : (
          <EmptyState
            hasConnectedSites={siteCount > 0}
            hasQuery={Boolean(searchQuery)}
            onReset={() => {
              searchInputRef.current?.setValue('');
              setSearchQuery('');
            }}
          />
        )}
      </div>
    </div>
  );
}
