import { SanitizedPortfolio } from '@/shared/fungible/sanitize-portfolio';
import { formatFiat, formatFiatToParts } from '@/shared/units/format-fiat';
import { FungibleListGroupedVirtual } from '@/ui/components/fungible/FungibleListGroupedVirtual';
import { useDiscoveredTokens } from '@/ui/components/fungible/useDiscoveredTokens';
import { useWalletPortfolioSummary } from '@/ui/hooks/request/external/use-wallet-portfolio-summary';
import { useAddressParams } from '@/ui/hooks/request/internal/useAddressParams';
import { useFiatConversion } from '@/ui/hooks/useFiatConversion';
import { NeutralDecimals } from '@/ui/ui-kit';
import { memo, useCallback, useMemo, useState } from 'react';
import { FaWallet } from 'react-icons/fa6';
import { LuPlus } from 'react-icons/lu';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ConnectionSite } from './connection-site';
import { OverviewCard } from './overview-card';

interface TokenHeaderProps {
  totalValueUsd: number;
  convertUsdToFiat: (usd: number) => number;
  defaultCurrency: string;
  onImport: () => void;
}

const TokenHeader = memo(function TokenHeader({
  totalValueUsd,
  convertUsdToFiat,
  defaultCurrency,
  onImport,
}: TokenHeaderProps) {
  return (
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
        onClick={onImport}
        className="flex items-center gap-[7px] hover:opacity-80 transition-opacity"
      >
        <LuPlus size={15} />
        <span className="font-medium text-sm">Import</span>
      </button>
    </div>
  );
});

export function Overview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const networkId = searchParams.get('network') || 'all';
  const { singleAddress: currentAddress } = useAddressParams();

  const isAllNetworks = networkId === 'all';

  const [isConnectionSite, setIsConnectionSite] = useState(false);
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null
  );

  const { data, hiddenTokens, isLoading } = useDiscoveredTokens(
    currentAddress,
    networkId
  );

  const { data: portfolioSummary } = useWalletPortfolioSummary({
    addresses: [currentAddress],
  });

  const { convertUsdToFiat, defaultCurrency } = useFiatConversion();

  const totalValueUsd = useMemo(() => {
    const visible = data?.reduce((sum, h) => sum + (h.valueUsd || 0), 0) ?? 0;
    const hidden =
      hiddenTokens?.reduce((sum, h) => sum + (h.valueUsd || 0), 0) ?? 0;
    return visible + hidden;
  }, [data, hiddenTokens]);

  const balanceFormatted = useMemo(
    () =>
      formatFiat(
        convertUsdToFiat(portfolioSummary?.totalValue || 0),
        defaultCurrency
      ),
    [portfolioSummary?.totalValue, convertUsdToFiat, defaultCurrency]
  );

  const handleImport = useCallback(() => navigate('/import-token'), [navigate]);

  const handleTokenClick = useCallback(
    (token: SanitizedPortfolio) => {
      navigate(`/fungible/${encodeURIComponent(token.id)}`, {
        state: { token },
      });
    },
    [navigate]
  );

  const handleConnectionSite = () => {
    setIsConnectionSite(!isConnectionSite);
  };

  return (
    <div
      ref={setScrollElement}
      className="w-full h-full min-h-0 overflow-y-auto flex flex-col"
    >
      <ConnectionSite isHidden={!isConnectionSite} />

      <OverviewCard
        balance={balanceFormatted}
        onMenuOpen={() => navigate('/settings')}
        onConnectionSite={handleConnectionSite}
      />

      <div className="flex-1 p-4">
        <TokenHeader
          totalValueUsd={totalValueUsd}
          convertUsdToFiat={convertUsdToFiat}
          defaultCurrency={defaultCurrency}
          onImport={handleImport}
        />

        <FungibleListGroupedVirtual
          data={data || []}
          hiddenData={hiddenTokens || []}
          isLoading={isLoading}
          hiddenBadge={!isAllNetworks}
          scrollElement={scrollElement}
          onTokenClick={handleTokenClick}
        />
      </div>
    </div>
  );
}
