import { SanitizedPortfolio } from '@/shared/fungible/sanitize-portfolio';
import {
  OptimisticFungibleInfo,
  useFungibleInfo,
  FungibleInfo as FungibleInfoComponent,
} from '@/ui/components/fungible/fungible-info';
import { LuLoader } from 'react-icons/lu';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export function FungibleInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const decodedId = id ? decodeURIComponent(id) : undefined;

  const { state } = useLocation();
  const initialData = state?.token as SanitizedPortfolio | undefined;

  if (!decodedId) {
    return (
      <div className="flex flex-col w-full h-full bg-background overflow-y-auto no-scrollbar items-center justify-center text-center pt-10">
        <p className="text-foreground/70">Something went wrong.</p>
        <button
          onClick={() =>
            navigate('/overview', { state: { direction: 'back' } })
          }
          className="mt-4 text-primary underline text-sm"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const { chain, fungibleInfo, isBalanceLoading } = useFungibleInfo(decodedId);

  const handleActionClick = (label: string) => {
    if (label === 'Send') navigate('send');
  };

  if (fungibleInfo && !isBalanceLoading && chain) {
    return (
      <FungibleInfoComponent
        data={fungibleInfo}
        chain={chain}
        onActionClick={handleActionClick}
      />
    );
  }

  if (initialData) {
    const optimisticData: OptimisticFungibleInfo = {
      id: initialData.id,
      assetId: initialData.assetId,
      chainId: Number(initialData.chainId),
      address: initialData.address,
      name: initialData.name,
      symbol: initialData.symbol,
      decimals: initialData.decimals,
      verified: undefined,
      type: initialData.type,
      metadata: {
        logoUrl: initialData.logoUrl,
        description: '',
        links: { twitter: '', website: '', discord: '' },
        availableOn: [],
      },
      amount: {
        raw: initialData.rawAmount,
        amount: Number(initialData.amount),
        amountUsd: initialData.valueUsd,
      },
      market: {
        price: initialData.priceUsd,
        marketCap: undefined,
        dilutedMarketCap: undefined,
        totalVolume: undefined,
        circulatingSupply: undefined,
        allTimeHigh: undefined,
        allTimeLow: undefined,
        changePercent: initialData.priceChange,
      },
    };

    return (
      <FungibleInfoComponent
        data={optimisticData}
        chain={undefined}
        onActionClick={handleActionClick}
      />
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-background overflow-y-auto no-scrollbar items-center justify-center text-center pt-10">
      <LuLoader size={24} className="animate-spin" />
    </div>
  );
}
