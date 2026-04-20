import { Header } from '@/ui/components/header';
import { useNavigate } from 'react-router-dom';

export function WalletGroupView() {
  const navigate = useNavigate();

  return (
    <>
      <Header
        title="Wallet Group"
        onBack={() =>
          navigate('/settings/manage-wallets', { state: { direction: 'back' } })
        }
      />

      <div>Wallet Group</div>
    </>
  );
}
