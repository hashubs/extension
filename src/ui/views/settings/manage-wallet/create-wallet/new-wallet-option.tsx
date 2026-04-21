import { Header } from '@/ui/components/header';
import { BrandLogo } from '@/ui/components/svg';
import { Button } from '@/ui/ui-kit';
import { useNavigate } from 'react-router-dom';

export function NewWalletOptionView() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-background">
      <Header title="" onBack={() => navigate('/settings/manage-wallets')} />

      <div className="flex flex-col flex-1 items-center justify-center px-4 text-center">
        <BrandLogo className="w-16 h-16 mb-6" />
        <h1 className="text-2xl font-bold mb-2">Add Wallet</h1>
        <p className="text-muted-foreground text-sm">
          Choose an option to set up your wallet
        </p>
      </div>

      <div className="px-4 space-y-3 pb-4">
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('select-group')}
        >
          Create New Wallet
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={() => navigate('existing')}
        >
          Add Existing Wallet
        </Button>
      </div>
    </div>
  );
}
