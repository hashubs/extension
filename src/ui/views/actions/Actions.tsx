import type { AnyAddressAction } from '@/modules/ethereum/transactions/addressAction';
import { Layout } from '@/ui/components/layout';
import {
  PinnedSearchBody,
  PinnedSearchHeader,
} from '@/ui/components/Pinnedsearch/Pinnedsearch';
import { useAddressParams } from '@/ui/hooks/request/internal/useWallet';
import { usePinnedSearch } from '@/ui/hooks/usePinnedSearch';
import { useUnifiedActivity } from '@/ui/views/actions/useUnifiedActivity';
import {
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
} from 'react';
import { LuListFilter } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { useActionFilterParams } from './ActionFilters';
import { ActionInfo } from './ActionInfo';
import { ActionSearch } from './ActionSearch';
import { ActionsList } from './ActionsList/ActionsList';
import { ActionsListSkeleton } from './ActionsList/ActionsListSkeleton';
import { isMatchForAllWords } from './matchSearchQuery';
import { Modal } from './Modal';

function sortActions<T extends { timestamp: number }>(actions: T[]) {
  return [...actions].sort((a, b) => b.timestamp - a.timestamp);
}

function mergeLocalAndBackendActions(
  local: AnyAddressAction[],
  backend: AnyAddressAction[],
  hasMoreBackendActions: boolean
) {
  const backendHashes = new Set(
    backend.flatMap(
      (tx) =>
        tx.transaction?.hash ||
        tx.acts?.flatMap((act) => act.transaction.hash) ||
        []
    )
  );

  const lastBackendActionTimestamp = backend.at(-1)?.timestamp || 0;
  const lastBackendTimestamp = hasMoreBackendActions
    ? lastBackendActionTimestamp
    : 0;

  const merged = local
    .filter(
      (tx) =>
        tx.transaction?.hash &&
        !backendHashes.has(tx.transaction.hash) &&
        tx.timestamp >= lastBackendTimestamp
    )
    .concat(backend);

  return sortActions(merged);
}

function HistoryEmptyView({
  hasFilters,
  onReset,
}: {
  hasFilters: boolean;
  onReset(): void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <span className="text-4xl">🥺</span>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">No transactions</p>
        {hasFilters && (
          <button
            onClick={onReset}
            className="text-sm text-blue-500 hover:underline transition-all"
          >
            Reset all filters
          </button>
        )}
      </div>
    </div>
  );
}

function formatDate(date: Date): string {
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

function getAddressActionsCursor(dateStr: string) {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  const tzo = -d.getTimezoneOffset();
  const dif = tzo >= 0 ? '+' : '-';
  const pad = (num: number) =>
    Math.floor(Math.abs(num)).toString().padStart(2, '0');
  const customIso =
    d.getFullYear() +
    '-' +
    pad(d.getMonth() + 1) +
    '-' +
    pad(d.getDate()) +
    'T' +
    pad(d.getHours()) +
    ':' +
    pad(d.getMinutes()) +
    ':' +
    pad(d.getSeconds()) +
    dif +
    pad(tzo / 60) +
    ':' +
    pad(tzo % 60);

  return btoa(JSON.stringify([customIso]));
}

export function ActionsView() {
  const navigate = useNavigate();

  const {
    searchParams,
    setSearchParams,
    actionTypes,
    assetTypeParam,
    hasActiveFilters,
  } = useActionFilterParams();

  const { singleAddress: currentAddress } = useAddressParams();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [selectedTx, setSelectedTx] = useState<AnyAddressAction | null>(null);

  const { searchPinned, searchRef, scrollElement, setScrollElement } =
    usePinnedSearch();

  const selectedChain = searchParams.chain || null;

  const parsedActionTypes = useMemo(() => {
    return actionTypes.length ? (actionTypes as any[]) : undefined;
  }, [actionTypes]);

  const parsedAssetTypes = useMemo(() => {
    if (!assetTypeParam || assetTypeParam === 'all') return undefined;
    return [assetTypeParam as 'fungible' | 'nft'];
  }, [assetTypeParam]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useUnifiedActivity({
      addresses: [currentAddress],
      chain: selectedChain || undefined,
      actionTypes: parsedActionTypes,
      assetTypes: parsedAssetTypes,
      searchQuery: deferredSearchQuery || undefined,
      fungibleId: searchParams.fungibleId,
      initialCursor: searchParams.date
        ? getAddressActionsCursor(searchParams.date)
        : undefined,
    });

  const allBackendActions = useMemo(() => {
    return data?.pages.flatMap((page: any) => page.data) || [];
  }, [data]);

  const localActions = useMemo<AnyAddressAction[]>(() => [], []);

  const actions = useMemo(() => {
    let locals = localActions;

    if (deferredSearchQuery) {
      locals = locals.filter((item) =>
        isMatchForAllWords(deferredSearchQuery, item)
      );
    }

    if (parsedActionTypes) {
      locals = locals.filter((item) => {
        const type = item.type.value;
        return parsedActionTypes.includes(type as any);
      });
    }

    return mergeLocalAndBackendActions(
      locals,
      allBackendActions,
      Boolean(hasNextPage)
    );
  }, [
    localActions,
    allBackendActions,
    hasNextPage,
    deferredSearchQuery,
    parsedActionTypes,
  ]);

  const handleDateChange = useCallback(
    (date: Date | null) => {
      setSearchParams((current) => ({
        ...current,
        date: date ? formatDate(date) : undefined,
      }));
    },
    [setSearchParams]
  );

  const handleResetAll = useCallback(() => {
    setSearchParams({});
    setSearchQuery('');
  }, [setSearchParams]);

  const handleBack = () => {
    if (searchParams.fungibleId) {
      navigate(`/fungible/${encodeURIComponent(searchParams.fungibleId)}`, {
        state: { direction: 'back' },
      });
    } else {
      navigate('/overview', { state: { direction: 'back' } });
    }
  };

  const handleGoToFilter = () => {
    if (searchParams.fungibleId) {
      navigate(
        `/actions/filters?fungibleId=${encodeURIComponent(
          searchParams.fungibleId
        )}`
      );
    } else {
      navigate('/actions/filters');
    }
  };

  const hasAnyFilter =
    hasActiveFilters ||
    Boolean(searchParams.chain) ||
    Boolean(searchParams.date);

  return (
    <Layout
      ref={setScrollElement}
      onBack={handleBack}
      className="px-0"
      headerClassName="px-4"
      renderHeaderElement={
        <>
          <PinnedSearchHeader searchPinned={searchPinned} title="History">
            <ActionSearch
              value={searchQuery}
              onChange={setSearchQuery}
              searchPinned={searchPinned}
            />
          </PinnedSearchHeader>
          <button
            type="button"
            className="size-[32px] rounded-[9px] flex items-center justify-center bg-muted hover:bg-muted/80 relative"
            onClick={handleGoToFilter}
            aria-label="Filters"
          >
            <LuListFilter size={20} />
            {hasAnyFilter && (
              <span className="absolute top-2 right-1.5 size-2 bg-blue-500 rounded-full ring-2 ring-background transition-transform" />
            )}
          </button>
        </>
      }
    >
      <PinnedSearchBody searchPinned={searchPinned} searchRef={searchRef}>
        <ActionSearch value={searchQuery} onChange={setSearchQuery} />
      </PinnedSearchBody>

      {isLoading ? (
        <ActionsListSkeleton count={10} />
      ) : actions.length ? (
        <ActionsList
          actions={actions}
          scrollElement={scrollElement}
          hasMore={Boolean(hasNextPage)}
          isLoading={isFetchingNextPage}
          onLoadMore={fetchNextPage}
          targetDate={searchParams.date || null}
          onChangeDate={handleDateChange}
          onSelectTx={setSelectedTx}
        />
      ) : (
        <HistoryEmptyView
          hasFilters={Boolean(
            searchQuery ||
              hasActiveFilters ||
              searchParams.date ||
              selectedChain
          )}
          onReset={handleResetAll}
        />
      )}

      <Modal
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        title={selectedTx?.type.displayValue || ''}
      >
        {selectedTx && <ActionInfo addressAction={selectedTx} />}
      </Modal>
    </Layout>
  );
}
