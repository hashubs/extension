import { Header } from '@/ui/components/header';
import { LedgerIcon } from '@/ui/components/svg/ledger';
import { Card, CardItem } from '@/ui/ui-kit';
import { ItemType } from '@/ui/ui-kit/card';
import { IoDownloadOutline, IoEyeOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { IMPORT_ROUTES } from './constants';

export function ImportWalletOptionsView() {
  const navigate = useNavigate();

  const items: ItemType[] = [
    {
      icon: IoDownloadOutline,
      label: 'Import Wallet',
      subLabel:
        'Add an existing wallet using a recovery phrase or private key.',
      onClick: () => navigate(IMPORT_ROUTES.SECRET),
      iconClassName: 'text-lime-500 bg-lime-500/10',
    },
    {
      icon: LedgerIcon,
      label: 'Connect Ledger',
      subLabel: 'Use your hardware wallet with Selvo.',
      onClick: () => navigate(IMPORT_ROUTES.HARDWARE),
      iconClassName: 'text-lime-500 bg-lime-500/10',
    },
    {
      icon: IoEyeOutline,
      label: 'Watch Address',
      subLabel: 'Follow any wallets to track their onchain activities.',
      onClick: () => navigate(IMPORT_ROUTES.READONLY),
      iconClassName: 'text-lime-500 bg-lime-500/10',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      <Header title="Add Existing Wallet" onBack={() => navigate(-1)} />

      <div className="flex-1 p-4 pt-0 space-y-4 no-scrollbar overflow-y-auto">
        <Card>
          {items.map((item, i) => (
            <CardItem key={i} item={item} />
          ))}
        </Card>
      </div>
    </div>
  );
}
