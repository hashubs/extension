import { VerifyUserView } from '@/ui/components/verify-user';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { IMPORT_ROUTES } from '../import-wallet';
import { CREATE_WALLET_ROUTES, CREATE_WALLET_STEPS } from './constants';
import { CreateWalletOptionsView } from './create-wallet-option';
import { EcosystemSelectView } from './ecosystem-select';
import { GenerateWalletView } from './generate-wallet';
import { WalletGroupSelectView } from './wallet-group-select';

export function CreateWalletRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <CreateWalletOptionsView
            onBack={() => navigate(-1)}
            onSelectNewPhrase={() =>
              navigate(CREATE_WALLET_ROUTES.SELECT_GROUP)
            }
            onSelectExisting={() => navigate(IMPORT_ROUTES.ROOT)}
          />
        }
      />

      <Route
        path={CREATE_WALLET_STEPS.SELECT_GROUP}
        element={
          <WalletGroupSelectView
            onBack={() => navigate(-1)}
            onAddWallet={(groupId) =>
              navigate(`/add-wallet?groupId=${groupId}`)
            }
            onAddNewPhrase={() =>
              navigate(CREATE_WALLET_ROUTES.SELECT_ECOSYSTEM)
            }
          />
        }
      />

      <Route
        path={CREATE_WALLET_STEPS.SELECT_ECOSYSTEM}
        element={
          <EcosystemSelectView
            onBack={() => navigate(-1)}
            onNext={(ecosystems) => {
              const params = new URLSearchParams();
              ecosystems.forEach((id) => params.append('ecosystems', id));
              navigate(`${CREATE_WALLET_ROUTES.VERIFY}?${params.toString()}`);
            }}
          />
        }
      />

      <Route
        path={CREATE_WALLET_STEPS.VERIFY}
        element={
          <VerifyUserView
            text="Your recovery phrase will be generated and encrypted securely."
            buttonTitle="Generate Wallet"
            onBack={() => navigate(-1)}
            onSuccess={() =>
              navigate(`${CREATE_WALLET_ROUTES.GENERATE}${location.search}`, {
                replace: true,
              })
            }
          />
        }
      />

      <Route
        path={CREATE_WALLET_STEPS.GENERATE}
        element={
          <GenerateWalletView
            onBack={() => navigate('/settings/manage-wallets')}
            onSuccess={() => navigate('/overview', { replace: true })}
            onSessionExpired={() =>
              navigate(`${CREATE_WALLET_ROUTES.SELECT_ECOSYSTEM}`, {
                replace: true,
              })
            }
          />
        }
      />
    </Routes>
  );
}
