import { AnyAddressAction } from '@/modules/ethereum/transactions/addressAction';
import { SanitizedPortfolio } from '@/shared/fungible/sanitize-portfolio';
import {
  FungibleInfo as FungibleInfoComponent,
  OptimisticFungibleInfo,
  useFungibleInfo,
} from '@/ui/components/fungible/fungible-info';
import { useAddressParams } from '@/ui/hooks/request/internal/useAddressParams';
import { ActionInfo } from '@/ui/views/actions/ActionInfo';
import { Modal } from '@/ui/views/actions/Modal';
import { useUnifiedActivity } from '@/ui/views/actions/useUnifiedActivity';
import { useState } from 'react';
import { LuLoader } from 'react-icons/lu';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export function FungibleInfoView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const decodedId = id ? decodeURIComponent(id) : undefined;
  const [selectedTx, setSelectedTx] = useState<AnyAddressAction | null>(null);

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

  const { singleAddress } = useAddressParams();
  const { actions, isLoading: isActionsLoading } = useUnifiedActivity({
    addresses: [singleAddress],
    fungibleId: decodedId,
  });

  const recentActions = actions.slice(0, 5);

  const handleActionClick = (label: string) => {
    if (label === 'Send') navigate('send');
  };

  const handleViewAllActivity = () => {
    navigate(`/actions?fungibleId=${encodeURIComponent(decodedId)}`, {
      state: { direction: 'forward' },
    });
  };

  if (fungibleInfo && !isBalanceLoading && chain) {
    return (
      <>
        <FungibleInfoComponent
          data={fungibleInfo}
          chain={chain}
          onActionClick={handleActionClick}
          recentActions={recentActions}
          isActionsLoading={isActionsLoading}
          onViewAllActivity={handleViewAllActivity}
          onSelectAction={setSelectedTx}
        />
        <Modal
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          title={selectedTx?.type.displayValue || ''}
        >
          {selectedTx && <ActionInfo addressAction={selectedTx} />}
        </Modal>
      </>
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
      <>
        <FungibleInfoComponent
          data={optimisticData}
          chain={undefined}
          onActionClick={handleActionClick}
          recentActions={recentActions}
          isActionsLoading={isActionsLoading}
          onViewAllActivity={handleViewAllActivity}
          onSelectAction={setSelectedTx}
        />
        <Modal
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          title={selectedTx?.type.displayValue || ''}
        >
          {selectedTx && <ActionInfo addressAction={selectedTx} />}
        </Modal>
      </>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-background overflow-y-auto no-scrollbar items-center justify-center text-center pt-10">
      <LuLoader size={24} className="animate-spin" />
    </div>
  );
}
