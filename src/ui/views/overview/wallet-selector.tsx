import { walletPort } from '@/shared/channel';
import { BlockieAddress } from '@/ui/components/blockie';
import { WalletDisplayName } from '@/ui/components/wallet';
import { useAddressParams } from '@/ui/hooks/request/internal/useAddressParams';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

export function WalletSelector() {
  const navigate = useNavigate();

  const { singleAddress } = useAddressParams();
  const { data: wallet } = useQuery({
    queryKey: ['wallet/uiGetCurrentWallet'],
    queryFn: () => walletPort.request('uiGetCurrentWallet'),
  });

  const address = wallet?.address || singleAddress;

  const handleSelectWallet = () => {
    navigate('/select-wallet');
  };

  return (
    <div
      onClick={handleSelectWallet}
      role="button"
      className="flex items-center gap-2.5 cursor-pointer"
    >
      <BlockieAddress address={address} size={32} borderRadius={6} />
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
  );
}
