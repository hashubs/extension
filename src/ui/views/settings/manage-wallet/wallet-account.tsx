import { Header } from '@/ui/components/header';
import { useNavigate } from 'react-router-dom';

export function WalletAccountView() {
  const navigate = useNavigate();

  return (
    <>
      <Header
        title="Wallet Account"
        onBack={() =>
          navigate('/settings/manage-wallets', { state: { direction: 'back' } })
        }
      />

      <div>Wallet Account</div>
    </>
  );
}
