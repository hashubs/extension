import { AnyAddressAction } from '@/modules/ethereum/transactions/addressAction';
import { NetworkConfig } from '@/modules/networks/network-config';
import { parseCaip19 } from '@/shared/chains/parse-caip19';
import { getR2TokenUrl } from '@/shared/get-r2-url';
import { ChainInfo } from '@/shared/request/external/asset-get-fungible-info';
import { formatFiat } from '@/shared/units/format-fiat';
import { formatPercentDisplay } from '@/shared/units/format-percent';
import { formatTokenAmount } from '@/shared/units/format-token';
import {
  FungibleChart,
  FungibleChartChangeData,
} from '@/ui/components/fungible/chart-fungible/chart';
import { Header } from '@/ui/components/header';
import { useFiatConversion } from '@/ui/hooks/useFiatConversion';
import { cn, truncateAddress } from '@/ui/lib/utils';
import { Image } from '@/ui/ui-kit';
import { ImageStack } from '@/ui/ui-kit/image';
import { ActionItem } from '@/ui/views/actions/ActionItem';
import { useState } from 'react';
import { Content } from 'react-area';
import {
  LuArrowUpDown,
  LuDollarSign,
  LuLink,
  LuLoader,
  LuReceiptText,
  LuSend,
} from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { OptimisticFungibleInfo } from './use-fungible-info';
import { useHeaderPriceReveal } from './use-header-price-reveal';

interface Props {
  data: OptimisticFungibleInfo;
  chain?: NetworkConfig;
  onActionClick: (label: string) => void;
  recentActions?: AnyAddressAction[];
  isActionsLoading?: boolean;
  onViewAllActivity: () => void;
  onSelectAction?: (tx: AnyAddressAction) => void;
}

export function FungibleInfo({
  data,
  chain,
  onActionClick,
  recentActions = [],
  isActionsLoading,
  onViewAllActivity,
  onSelectAction,
}: Props) {
  const navigate = useNavigate();
  const { convertUsdToFiat, defaultCurrency } = useFiatConversion();

  const [isExpanded, setIsExpanded] = useState(false);
  const [chartData, setChartData] = useState<FungibleChartChangeData | null>(
    null
  );

  const { triggerRef, styles, animated } = useHeaderPriceReveal();

  const parse = parseCaip19(data?.assetId!);

  const price = data.market?.price ?? 0;
  const marketChangePercent = data.market?.changePercent ?? 0;

  const displayPrice = chartData !== null ? chartData.price : price;
  const changePercent =
    chartData !== null ? chartData.changePercent : marketChangePercent;
  const isPositive =
    chartData !== null ? chartData.isPositive : marketChangePercent >= 0;

  const amount = data.amount.amount;
  const valueUsd = displayPrice * amount;

  const description = data.metadata?.description ?? '';
  const shouldTruncate = description.length > 180;

  const staticItems: any[] = [
    {
      label: 'Network',
      value: chain?.name,
      logo: getR2TokenUrl(parse?.chainId ?? '', parse?.caip ?? ''),
    },
    { label: 'Token name', value: data?.name },
  ];

  if (data?.type !== 'TOKEN_TYPE_NATIVE') {
    staticItems.push({
      label: 'Contract',
      value: truncateAddress(data?.address),
      Icon: LuReceiptText,
      // action: handleCopy,
    });
  }

  const marketDataItems: any[] = [];
  if (data.market) {
    if (data.market.marketCap)
      marketDataItems.push({
        label: 'Market cap',
        value: formatFiat(
          convertUsdToFiat(data.market.marketCap),
          defaultCurrency,
          { compact: true }
        ),
      });
    if (data.market.totalVolume)
      marketDataItems.push({
        label: 'Volume (24h)',
        value: formatFiat(
          convertUsdToFiat(data.market.totalVolume),
          defaultCurrency,
          { compact: true }
        ),
      });
    if (data.market.dilutedMarketCap)
      marketDataItems.push({
        label: 'FDV',
        value: formatFiat(
          convertUsdToFiat(data.market.dilutedMarketCap),
          defaultCurrency,
          { compact: true }
        ),
      });
    if (data.market.circulatingSupply)
      marketDataItems.push({
        label: 'Circ. supply',
        value: formatTokenAmount(data.market.circulatingSupply),
      });
    if (data.market.allTimeHigh)
      marketDataItems.push({
        label: 'All time high',
        value: formatFiat(
          convertUsdToFiat(data.market.allTimeHigh),
          defaultCurrency,
          { isTokenPrice: true }
        ),
      });
    if (data.market.allTimeLow)
      marketDataItems.push({
        label: 'All time low',
        value: formatFiat(
          convertUsdToFiat(data.market.allTimeLow),
          defaultCurrency,
          { isTokenPrice: true }
        ),
      });
  }

  const availableOn: ChainInfo[] = (data?.metadata?.availableOn ?? [])
    .map((chain: ChainInfo) => ({
      chain: chain.chain,
      caip: chain.caip,
      chainId: chain.chainId,
      address: chain.address,
    }))
    .slice(0, 5);

  return (
    <div className="relative flex flex-col w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar bg-background">
      <Header
        onBack={() => navigate('/overview', { state: { direction: 'back' } })}
      />
      <Content name="custom-header">
        <div className="flex items-center bg-background border border-border/50 rounded-full pl-1.5 pr-3 py-1 overflow-hidden">
          <Image
            src={data.metadata?.logoUrl}
            alt={chain?.name || ''}
            className="size-[22px] rounded-full"
          />
          <span className="ml-1.5 text-[13px] font-medium uppercase truncate max-w-[150px]">
            {data?.symbol}
          </span>
          <animated.span
            style={styles}
            className="flex items-center overflow-hidden whitespace-nowrap"
          >
            {data.market && (
              <>
                <span className="mx-1.5 opacity-40">•</span>
                <span className="text-[13px] uppercase font-medium">
                  {formatFiat(
                    convertUsdToFiat(displayPrice ?? 0),
                    defaultCurrency
                  )}
                </span>
              </>
            )}
          </animated.span>
        </div>
      </Content>
      <div className="flex-1">
        {!!data.market && !!data.market.price && (
          <div className="relative">
            <div
              ref={triggerRef}
              className="inline-flex flex-row items-end gap-1 absolute left-[15px] bg-background rounded-lg z-10"
            >
              <span className="text-[26px] font-medium leading-none tracking-tight">
                {formatFiat(convertUsdToFiat(displayPrice), defaultCurrency)}
              </span>
              <span
                className={cn(
                  'text-[11px] font-semibold',
                  isPositive ? 'text-green-400' : 'text-red-400'
                )}
              >
                {formatPercentDisplay(Math.abs(changePercent))}
              </span>
            </div>

            <FungibleChart
              data={data}
              currentChangePercent={0}
              onChartDataChange={setChartData}
            />
          </div>
        )}

        {!!amount && (
          <div className="flex items-start justify-between px-4 py-[14px] border-b border-border/40">
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Balance
              </span>
              <span className="text-[20px] font-medium leading-none tracking-tight">
                {formatTokenAmount(amount, data.symbol)}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Value
              </span>
              <span className="text-[20px] font-medium leading-none tracking-tight">
                {formatFiat(convertUsdToFiat(valueUsd), defaultCurrency)}
              </span>
            </div>
          </div>
        )}

        <div className="px-4 pt-4">
          <h2 className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-3">
            Token info
          </h2>
          <div className="rounded-xl bg-muted/40 divide-y divide-border/40">
            {staticItems.map(({ label, value, Icon, logo, action }) => (
              <div
                key={label}
                className="flex justify-between items-center px-4 py-3"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  {Icon ? (
                    <Icon size={14} />
                  ) : (
                    <Image
                      src={logo}
                      alt={data?.name || ''}
                      className="size-3.5 rounded-full"
                    />
                  )}
                  <span className="text-[13px] font-medium">{label}</span>
                </div>
                {action ? (
                  <button
                    onClick={action}
                    className="text-[13px] font-semibold flex items-center gap-1.5 text-primary"
                  >
                    {value}
                    {/* {isSuccess ? <LuCheck size={13} /> : <LuCopy size={13} />} */}
                  </button>
                ) : (
                  <span className="text-[13px] font-semibold">{value}</span>
                )}
              </div>
            ))}

            {availableOn.length > 0 && (
              <div className="flex justify-between items-center px-4 py-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <LuLink size={14} />
                  <span className="text-[13px] font-medium">Chains</span>
                </div>
                <ImageStack
                  images={availableOn.map((a) => ({
                    src: getR2TokenUrl(a.chainId, a.caip),
                    alt: a.chain,
                  }))}
                  className="size-5 rounded-full"
                />
              </div>
            )}
          </div>
        </div>

        {marketDataItems.length > 0 && (
          <div className="px-4 pt-4">
            <h2 className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-3">
              Market data
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {marketDataItems.map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-muted/40 px-4 py-3">
                  <div className="text-[11px] text-muted-foreground mb-1">
                    {label}
                  </div>
                  <div className="text-[14px] font-semibold">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {description && (
          <div className="px-4 pt-4">
            <h2 className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-3">
              About
            </h2>
            <div className="rounded-xl bg-muted/40 px-4 py-3 border border-border/20">
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                {isExpanded ? description : description.slice(0, 180)}
                {shouldTruncate && (
                  <span
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className="ml-1 text-primary font-medium cursor-pointer hover:underline"
                  >
                    {isExpanded ? ' Read less' : '... Read more'}
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {(recentActions.length > 0 || isActionsLoading) && (
          <div className="px-4 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Recent Activity
              </h2>
              {recentActions.length > 0 && (
                <button
                  onClick={onViewAllActivity}
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  View All
                </button>
              )}
            </div>

            <div className="rounded-xl bg-muted/40 overflow-hidden divide-y divide-border/20 border border-border/20">
              {isActionsLoading && recentActions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <LuLoader className="size-5 text-primary animate-spin" />
                  <span className="text-[12px] text-muted-foreground">
                    Loading activity...
                  </span>
                </div>
              ) : (
                recentActions.map((action) => (
                  <ActionItem
                    key={action.id}
                    addressAction={action as AnyAddressAction}
                    onClick={
                      onSelectAction ? () => onSelectAction(action) : undefined
                    }
                  />
                ))
              )}
            </div>
          </div>
        )}

        <div className="h-8" />
      </div>

      <div className="sticky bottom-0 px-4 py-3 z-10 bg-background/40 backdrop-blur-md border-t border-border/40 flex items-center gap-2">
        <button
          onClick={() => onActionClick('Swap')}
          className="flex-1 flex items-center justify-center gap-2 h-[38px] rounded-2xl bg-muted border border-border/50 hover:bg-muted/80 active:scale-[0.98] transition-all"
        >
          <LuArrowUpDown size={15} className="text-foreground/80" />
          <span className="text-[14px] font-semibold">Swap</span>
        </button>

        <button
          onClick={() => onActionClick('Send')}
          disabled={data.amount.amount <= 0}
          className="w-[50px] h-[38px] flex items-center justify-center rounded-2xl bg-muted border border-border/50 hover:bg-muted/80 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Send"
        >
          <LuSend size={16} className="text-foreground/80" />
        </button>

        <button
          onClick={() => onActionClick('Buy')}
          className="w-[50px] h-[38px] flex items-center justify-center rounded-2xl bg-muted border border-border/50 hover:bg-muted/80 active:scale-[0.98] transition-all"
          aria-label="Buy"
        >
          <LuDollarSign size={16} className="text-foreground/80" />
        </button>
      </div>
    </div>
  );
}
