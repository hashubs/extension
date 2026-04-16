import { SortOption } from '@/shared/fungible/tokens-sort';
import { formatFiat, formatFiatToParts } from '@/shared/units/format-fiat';
import { FungibleList } from '@/ui/components/fungible/FungibleList';
import { useDiscoveredTokens } from '@/ui/components/fungible/useDiscoveredTokens';
import { useWalletPortfolioPnl } from '@/ui/hooks/request/external/use-wallet-portfolio-pnl';
import { useWalletPortfolioSummary } from '@/ui/hooks/request/external/use-wallet-portfolio-summary';
import { useAddressParams } from '@/ui/hooks/request/internal/useAddressParams';
import {
  useCurrentNetworkId,
  usePrefetchCurrentNetworkId,
} from '@/ui/hooks/request/internal/useCurrentNetworkId';
import { usePrefetchWalletGroups } from '@/ui/hooks/request/internal/useWalletGroups';
import { useFiatConversion } from '@/ui/hooks/useFiatConversion';
import { Button, NeutralDecimals } from '@/ui/ui-kit';
import { useMemo, useState } from 'react';
import { FaWallet } from 'react-icons/fa6';
import { LuPlus } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { ConnectionHeaderReveal } from './connection-header';
import { OverviewCard } from './overview-card';

export function Overview() {
  const navigate = useNavigate();

  usePrefetchWalletGroups();
  usePrefetchCurrentNetworkId();

  const { networkId: storedNetworkId } = useCurrentNetworkId();

  const { singleAddress: currentAddress } = useAddressParams();

  const [sortValue, setSortValue] = useState<SortOption>('native-top');
  const [showSortSelector, setShowSortSelector] = useState(false);

  const { data, hiddenTokens, isLoading } = useDiscoveredTokens(
    currentAddress,
    storedNetworkId || 'all'
  );

  const { data: portfolioPnl } = useWalletPortfolioPnl({
    addresses: [currentAddress],
  });
  console.log('[Overview] portfolioPnl', portfolioPnl);

  const { data: portfolioSummary } = useWalletPortfolioSummary({
    addresses: [currentAddress],
  });

  const { convertUsdToFiat, defaultCurrency } = useFiatConversion();

  const isAllNetworks = !storedNetworkId || storedNetworkId === 'all';

  const totalValueUsd = useMemo(() => {
    const visible = data?.reduce((sum, h) => sum + (h.valueUsd || 0), 0) || 0;
    const hidden =
      hiddenTokens?.reduce((sum, h) => sum + (h.valueUsd || 0), 0) || 0;
    return visible + hidden;
  }, [data, hiddenTokens]);

  const balanceFormatted = formatFiat(
    convertUsdToFiat(portfolioSummary?.totalValue || 0),
    defaultCurrency
  );

  return (
    <ConnectionHeaderReveal>
      {(dragHandlers) => (
        <div
          className="w-full h-full flex flex-col select-none"
          {...dragHandlers}
        >
          <OverviewCard
            balance={balanceFormatted}
            dragHandlers={dragHandlers}
          />

          <Button variant="secondary" onClick={() => navigate('/test-view')}>
            Test View
          </Button>

          <div className="flex-1 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FaWallet size={15} />
                <span className="text-sm font-medium">
                  <NeutralDecimals
                    parts={formatFiatToParts(
                      convertUsdToFiat(totalValueUsd),
                      defaultCurrency
                    )}
                  />
                </span>
              </div>

              <button
                onClick={() => navigate('/import-token')}
                className="flex items-center gap-[7px] hover:opacity-80 transition-opacity"
              >
                <LuPlus size={15} />
                <span className="font-medium text-sm">Import</span>
              </button>
            </div>

            <FungibleList
              data={data || []}
              hiddenData={hiddenTokens || []}
              sortOrder={sortValue}
              isLoading={isLoading}
              grouped={isAllNetworks}
              hiddenBadge={!isAllNetworks}
              onTokenClick={(token) => {
                console.log('Token clicked:', token);
                // navigate(`/fungible/${token.assetId}`);
              }}
            />
          </div>
        </div>
      )}
    </ConnectionHeaderReveal>
  );
}
