import { walletPort } from '@/shared/channel';
import { BlockieImg } from '@/ui/components/BlockieImg';
import { WalletDisplayName } from '@/ui/components/wallet';
import { useAddressParams } from '@/ui/hooks/request/internal/useAddressParams';
import { useQuery } from '@tanstack/react-query';
import { HiOutlineViewGrid } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

interface Props {
  onMenuOpen?: () => void;
}

export function OverviewHeader({ onMenuOpen }: Props) {
  const navigate = useNavigate();

  const { singleAddress, ready } = useAddressParams();
  const { data: wallet } = useQuery({
    queryKey: ['wallet/uiGetCurrentWallet'],
    queryFn: () => walletPort.request('uiGetCurrentWallet'),
    suspense: false,
    useErrorBoundary: true,
  });

  const address = wallet?.address || singleAddress;

  const handleSelectWallet = () => {
    navigate('/select-wallet');
  };

  if (!ready || !wallet) {
    return null;
  }

  return (
    <div className="flex items-center justify-between border-b border-muted pb-2 mb-4">
      <div
        onClick={handleSelectWallet}
        className="flex items-center gap-2.5 cursor-pointer"
      >
        <BlockieImg address={address} size={32} borderRadius={6} />
        <div className="flex flex-col gap-0.5">
          <WalletDisplayName
            wallet={wallet}
            maxCharacters={16}
            render={(data) => (
              <span className="text-[14px] font-semibold leading-none overflow-hidden text-ellipsis text-nowrap">
                {data.value}
              </span>
            )}
          />

          <div className="flex items-center">
            <div className="w-3.5 h-3.5 rounded-full bg-[#627eea] border-2 border-white dark:border-[#171717] z-10" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#9945ff] border-2 border-white dark:border-[#171717] -ml-1" />
          </div>
        </div>
      </div>

      <button
        onClick={onMenuOpen}
        className="text-muted-foreground/80 hover:opacity-70 transition-opacity p-1 rounded-md"
      >
        <HiOutlineViewGrid size={20} />
      </button>
    </div>
  );
}
