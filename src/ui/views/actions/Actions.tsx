import type { AnyAddressAction } from '@/modules/ethereum/transactions/addressAction';
import { useAddressParams } from '@/ui/hooks/request/internal/useAddressParams';
import { useUnifiedActivity } from '@/ui/views/actions/useUnifiedActivity';
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { LuChevronLeft } from 'react-icons/lu';
import { Route, Routes, useNavigate } from 'react-router-dom';
import {
  ActionFilters,
  ActionFiltersButton,
  useActionFilterParams,
} from './ActionFilters';
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

function ActionHome() {
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
  const [searchPinned, setSearchPinned] = useState(false);

  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null
  );
  const searchRef = useRef<HTMLDivElement>(null);
  const filterOffsetTopRef = useRef<number>(0);

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

  useEffect(() => {
    if (searchRef.current) {
      filterOffsetTopRef.current = searchRef.current.offsetTop;
    }
  }, []);

  useEffect(() => {
    if (!scrollElement) return;

    const handleScroll = () => {
      const isPinned = scrollElement.scrollTop >= filterOffsetTopRef.current;
      setSearchPinned((prev) => (prev !== isPinned ? isPinned : prev));
    };

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [scrollElement]);

  return (
    <div
      ref={setScrollElement}
      className="flex flex-col h-full w-full overflow-y-auto relative"
    >
      <div
        className="sticky top-0 bg-background/80 backdrop-blur-md shrink-0 z-20 overflow-hidden"
        style={{ height: '62px' }}
      >
        <div className="absolute inset-0 flex items-center justify-between px-4 gap-3">
          <button
            type="button"
            className="size-[30px] rounded-[9px] flex items-center justify-center bg-muted hover:bg-muted/80"
            onClick={() =>
              navigate('/overview', { state: { direction: 'back' } })
            }
            aria-label="Back"
          >
            <LuChevronLeft size={20} />
          </button>

          <div
            className="relative flex-1 flex items-center justify-center overflow-hidden"
            style={{ height: '36px' }}
          >
            <h1
              className="absolute text-base font-semibold tracking-wide transition-all duration-300 ease-in-out whitespace-nowrap"
              style={{
                opacity: searchPinned ? 0 : 1,
                transform: searchPinned
                  ? 'translateY(-10px)'
                  : 'translateY(0px)',
                pointerEvents: searchPinned ? 'none' : 'auto',
              }}
            >
              History
            </h1>

            <div
              className="absolute w-full transition-all duration-300 ease-in-out"
              style={{
                opacity: searchPinned ? 1 : 0,
                transform: searchPinned
                  ? 'translateY(0px)'
                  : 'translateY(10px)',
                pointerEvents: searchPinned ? 'auto' : 'none',
              }}
            >
              <ActionSearch
                value={searchQuery}
                onChange={setSearchQuery}
                searchPinned={searchPinned}
              />
            </div>
          </div>

          <ActionFiltersButton
            hasActiveFilters={hasActiveFilters}
            selectedChain={searchParams.chain || null}
            date={searchParams.date}
          />
        </div>
      </div>

      <div
        ref={searchRef}
        className="px-4 pb-2 bg-background/50"
        style={{
          opacity: searchPinned ? 0 : 1,
          pointerEvents: searchPinned ? 'none' : 'auto',
          transition: 'opacity 0.25s ease',
        }}
      >
        <ActionSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

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
    </div>
  );
}

export function Actions() {
  return (
    <Routes>
      <Route path="/" element={<ActionHome />} />
      <Route path="/filters" element={<ActionFilters />} />
    </Routes>
  );
}
