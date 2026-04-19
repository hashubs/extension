import { Header } from '@/ui/components/header';
import { Button, Card } from '@/ui/ui-kit';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LuChevronRight } from 'react-icons/lu';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ActionDaySelector } from './ActionDaySelector';
import { ActionSelector } from './ActionSelector';

import { cn } from '@/ui/lib/utils';

export type ActionSearchParams = {
  date?: string;
  chain?: string;
  actionTypes?: string;
  assetTypes?: string;
  fungibleId?: string;
  chainName?: string;
};

const ACTION_TYPE_OPTIONS = [
  { value: 'trade', label: 'Trade' },
  { value: 'mint', label: 'Mint' },
  { value: 'send', label: 'Send' },
  { value: 'receive', label: 'Receive' },
  { value: 'others', label: 'Others' },
];

const ASSET_TYPE_OPTIONS = [
  { value: 'all', label: 'All Assets' },
  { value: 'nft', label: 'NFTs' },
  { value: 'fungible', label: 'Tokens' },
];

const OTHERS_ACTION_TYPES = [
  'execute',
  'burn',
  'deposit',
  'withdraw',
  'approve',
  'revoke',
  'deploy',
  'cancel',
  'borrow',
  'repay',
  'stake',
  'unstake',
  'claim',
  'batch_execute',
];

function parseActionTypes(param?: string): string[] {
  if (!param) return [];
  const keys = param.split(',');
  const result: string[] = [];
  for (const key of keys) {
    if (key === 'others') {
      result.push(...OTHERS_ACTION_TYPES);
    } else {
      result.push(key);
    }
  }
  return result;
}

export function useActionFilterParams() {
  const [searchParams, setSearchParamsState] = useSearchParams();

  const parsedParams = useMemo(
    () => ({
      date: searchParams.get('date') || undefined,
      chain: searchParams.get('chain') || undefined,
      actionTypes: searchParams.get('actionTypes') || undefined,
      assetTypes: searchParams.get('assetTypes') || undefined,
      fungibleId: searchParams.get('fungibleId') || undefined,
      chainName: searchParams.get('chainName') || undefined,
    }),
    [searchParams]
  );

  const setSearchParams = useCallback(
    (
      update:
        | ActionSearchParams
        | ((prev: ActionSearchParams) => ActionSearchParams)
    ) => {
      const next = typeof update === 'function' ? update(parsedParams) : update;
      const cleanNext: Record<string, string> = {};
      Object.entries(next).forEach(([key, val]) => {
        if (val) cleanNext[key] = val;
      });
      setSearchParamsState(cleanNext);
    },
    [parsedParams, setSearchParamsState]
  );

  const actionTypeKeys = useMemo(
    () =>
      parsedParams.actionTypes
        ? parsedParams.actionTypes.split(',').filter(Boolean)
        : [],
    [parsedParams.actionTypes]
  );

  const actionTypes = useMemo(
    () => parseActionTypes(parsedParams.actionTypes),
    [parsedParams.actionTypes]
  );

  const hasActiveFilters = Boolean(
    parsedParams.actionTypes ||
      parsedParams.assetTypes ||
      parsedParams.chain ||
      parsedParams.date ||
      parsedParams.fungibleId
  );

  return {
    searchParams: parsedParams,
    setSearchParams,
    actionTypes,
    actionTypeKeys,
    assetTypeParam: parsedParams.assetTypes,
    hasActiveFilters,
  };
}

function FilterRow({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  const Content = (
    <>
      <span className="text-sm font-medium">{label}</span>
      <LuChevronRight
        size={15}
        className="group-hover:translate-x-0.5 transition-all"
      />
    </>
  );

  const className =
    'w-full px-2.5 py-2.5 flex items-center justify-between transition-all group text-left hover:bg-black/5 dark:hover:bg-white/5';

  if (onClick) {
    return (
      <button onClick={onClick} className={className}>
        {Content}
      </button>
    );
  }

  return <div className={className}>{Content}</div>;
}

export function ActionFiltersView() {
  const navigate = useNavigate();
  const { searchParams, hasActiveFilters, actionTypeKeys, assetTypeParam } =
    useActionFilterParams();

  const [stagedChain, setStagedChain] = useState<string | null>(
    searchParams.chain || null
  );
  const [stagedDate, setStagedDate] = useState<string | undefined>(
    searchParams.date
  );
  const [stagedActionTypeKeys, setStagedActionTypeKeys] =
    useState<string[]>(actionTypeKeys);
  const [stagedAssetType, setStagedAssetType] = useState<string | undefined>(
    assetTypeParam
  );
  const [stagedChainName, setStagedChainName] = useState<string | undefined>(
    searchParams.chainName
  );

  const isFromFungibleInfo = !!searchParams.fungibleId;

  // Sync staged state with URL params when they change (e.g. returning from network selector)
  useEffect(() => {
    setStagedChain(searchParams.chain || null);
  }, [searchParams.chain]);

  useEffect(() => {
    setStagedDate(searchParams.date);
  }, [searchParams.date]);

  useEffect(() => {
    setStagedActionTypeKeys(actionTypeKeys);
  }, [actionTypeKeys]);

  useEffect(() => {
    setStagedAssetType(assetTypeParam);
  }, [assetTypeParam]);

  useEffect(() => {
    setStagedChainName(searchParams.chainName);
  }, [searchParams.chainName]);

  const handleSelectNetwork = useCallback(() => {
    if (isFromFungibleInfo) return;

    const params = new URLSearchParams();
    if (stagedDate) params.set('date', stagedDate);
    if (stagedActionTypeKeys.length) {
      params.set('actionTypes', stagedActionTypeKeys.join(','));
    }
    if (stagedAssetType && stagedAssetType !== 'all') {
      params.set('assetTypes', stagedAssetType);
    }
    if (searchParams.fungibleId) {
      params.set('fungibleId', searchParams.fungibleId);
    }
    if (stagedChainName) {
      params.set('chainName', stagedChainName);
    }

    const nextPath = `/actions/filters?${params.toString()}`;

    const selectorParams = new URLSearchParams();
    selectorParams.set('paramName', 'chain');
    selectorParams.set('chain', stagedChain || 'all');
    selectorParams.set('next', nextPath);

    navigate(`/select-network?${selectorParams.toString()}`, {
      state: { direction: 'forward' },
    });
  }, [
    navigate,
    isFromFungibleInfo,
    stagedChain,
    stagedDate,
    stagedActionTypeKeys,
    stagedAssetType,
    searchParams.fungibleId,
  ]);

  const handleApply = () => {
    const params = new URLSearchParams();
    if (stagedChain) params.set('chain', stagedChain);
    if (stagedDate) params.set('date', stagedDate);
    if (stagedActionTypeKeys.length) {
      params.set('actionTypes', stagedActionTypeKeys.join(','));
    }
    if (stagedAssetType && stagedAssetType !== 'all') {
      params.set('assetTypes', stagedAssetType);
    }

    if (searchParams.fungibleId) {
      params.set('fungibleId', searchParams.fungibleId);
    }

    if (stagedChainName) {
      params.set('chainName', stagedChainName);
    }

    navigate({
      pathname: '/actions',
      search: params.toString(),
    });
  };

  const hasAnyFilter =
    hasActiveFilters ||
    Boolean(searchParams.chain) ||
    Boolean(searchParams.date);

  const handleBack = () => {
    if (searchParams.fungibleId) {
      navigate(
        `/actions?fungibleId=${encodeURIComponent(searchParams.fungibleId)}`,
        { state: { direction: 'back' } }
      );
    } else {
      navigate('/actions', { state: { direction: 'back' } });
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      <Header title="Filters" onBack={handleBack} />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="flex flex-col px-4 py-4 space-y-4">
          <div>
            <Card
              title="Select Network"
              className={cn(
                isFromFungibleInfo && 'opacity-50 cursor-not-allowed'
              )}
            >
              <FilterRow
                label={stagedChainName || 'All Networks'}
                onClick={handleSelectNetwork}
              />
            </Card>
          </div>

          <div>
            <Card title="Date">
              <ActionDaySelector
                trigger={
                  <FilterRow
                    label={
                      stagedDate
                        ? new Intl.DateTimeFormat('en', {
                            dateStyle: 'medium',
                          }).format(new Date(stagedDate))
                        : 'Select Date'
                    }
                  />
                }
                selectedDate={stagedDate ? new Date(stagedDate) : null}
                onDateSelect={(d) => {
                  setStagedDate(d?.toISOString());
                }}
                className="w-full text-left"
              />
            </Card>
          </div>

          <div>
            <Card title="Asset Type">
              <ActionSelector
                title="Asset Type"
                options={ASSET_TYPE_OPTIONS}
                value={stagedAssetType || 'all'}
                onChange={(v) => {
                  setStagedAssetType(v as string);
                }}
                trigger={
                  <FilterRow
                    label={
                      ASSET_TYPE_OPTIONS.find(
                        (o) => o.value === (stagedAssetType || 'all')
                      )?.label || 'All Assets'
                    }
                  />
                }
              />
            </Card>
          </div>

          <div>
            <Card title="Transaction Type">
              <ActionSelector
                title="Transaction Type"
                options={ACTION_TYPE_OPTIONS}
                value={stagedActionTypeKeys}
                multi
                onChange={(v) => {
                  setStagedActionTypeKeys(v as string[]);
                }}
                trigger={
                  <FilterRow
                    label={
                      stagedActionTypeKeys.length
                        ? `${stagedActionTypeKeys.length} Types`
                        : 'All Types'
                    }
                  />
                }
              />
            </Card>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4 bg-background border-t border-border mt-auto">
        <Button onClick={handleApply} variant="gradient-teal" size="md" shimmer>
          Show Results
        </Button>
        {hasAnyFilter && (
          <button
            onClick={() => {
              navigate('/actions');
            }}
            className="flex-1 font-normal text-sm py-2"
          >
            Reset All Filters
          </button>
        )}
      </div>
    </div>
  );
}
