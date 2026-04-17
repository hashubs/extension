import { LuLoader } from 'react-icons/lu';
import { useNavigate, useParams } from 'react-router-dom';
import { FungibleInfoComponent } from './fungible-info.component';
import { useFungibleInfo } from './use-fungible-info';

export function FungibleInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const decodedId = id ? decodeURIComponent(id) : undefined;

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

  const { chain, fungibleInfo, isFungibleInfoLoading } =
    useFungibleInfo(decodedId);

  const handleActionClick = (label: string) => {
    if (label === 'Send') {
      navigate('send');
    }
  };

  if (isFungibleInfoLoading || !fungibleInfo || !chain) {
    return (
      <div className="flex flex-col w-full h-full bg-background overflow-y-auto no-scrollbar items-center justify-center text-center pt-10">
        <LuLoader size={24} className="animate-spin" />
      </div>
    );
  }

  return (
    <FungibleInfoComponent
      data={fungibleInfo}
      chain={chain}
      onActionClick={handleActionClick}
    />
  );
}
