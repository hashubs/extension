import { VerifyUserView } from '@/ui/components/verify-user';
import { MemoryLocationState } from '@/ui/shared/memoryLocationState';
import { useCallback } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { AddReadOnlyAddressView } from './add-read-only-address';
import {
  IMPORT_ROUTES,
  MNEMONIC_STEPS,
  PRIVATE_KEY_STEPS,
  SHARED_IMPORT_STEPS,
} from './constants';

import {
  MnemonicImportProcessor,
  PrivateKeyImportProcessor,
  WalletDiscoveryView,
} from '@/ui/components/wallet-setup';
import { ImportWalletOptionsView } from './import-wallet-options';
import { ImportWalletSecretView } from './import-wallet-secret';

const globalMemoryLocationState = new MemoryLocationState({});

export function ImportWalletRoutes() {
  const navigate = useNavigate();

  const handleFinish = useCallback(() => {
    globalMemoryLocationState.setState({});
    navigate('/overview', { replace: true });
  }, [navigate]);

  const handleSessionExpired = useCallback(() => {
    navigate(IMPORT_ROUTES.ROOT, { replace: true });
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<ImportWalletOptionsView />} />

      <Route
        path="secret"
        element={
          <ImportWalletSecretView
            locationStateStore={globalMemoryLocationState}
          />
        }
      />

      <Route path="mnemonic">
        <Route
          path={MNEMONIC_STEPS.VERIFY}
          element={
            <VerifyUserView
              text="Recovery phrase will be encrypted with your password"
              buttonTitle="Continue"
              onBack={() => navigate(-1)}
              onSuccess={() =>
                navigate(
                  `${IMPORT_ROUTES.MNEMONIC}/${MNEMONIC_STEPS.DISCOVERY}?state=memory`,
                  { replace: true }
                )
              }
            />
          }
        />
        <Route
          path={MNEMONIC_STEPS.DISCOVERY}
          element={
            <WalletDiscoveryView
              locationStateStore={globalMemoryLocationState}
              onBack={() => navigate(-1)}
              onSessionExpired={handleSessionExpired}
              onSuccess={(selectedWallets) =>
                navigate(
                  `${IMPORT_ROUTES.MNEMONIC}/${SHARED_IMPORT_STEPS.SUCCESS}`,
                  {
                    replace: true,
                    state: { values: selectedWallets },
                  }
                )
              }
            />
          }
        />
        <Route
          path={SHARED_IMPORT_STEPS.SUCCESS}
          element={
            <MnemonicImportProcessor
              onBack={() => navigate('/settings/manage-wallets')}
              onSessionExpired={handleSessionExpired}
              onSuccess={handleFinish}
            />
          }
        />
      </Route>

      <Route path="private-key">
        <Route
          path={PRIVATE_KEY_STEPS.VERIFY}
          element={
            <VerifyUserView
              text="Your private key will be encrypted with your password"
              buttonTitle="Continue"
              onBack={() => navigate(-1)}
              onSuccess={() =>
                navigate(
                  `${IMPORT_ROUTES.PRIVATE_KEY}/${SHARED_IMPORT_STEPS.SUCCESS}?state=memory`,
                  { replace: true }
                )
              }
            />
          }
        />
        <Route
          path={SHARED_IMPORT_STEPS.SUCCESS}
          element={
            <PrivateKeyImportProcessor
              locationStateStore={globalMemoryLocationState}
              onBack={() => navigate(-1)}
              onSessionExpired={handleSessionExpired}
              onSuccess={handleFinish}
            />
          }
        />
      </Route>

      <Route
        path="hardware"
        element={<div>Hardware Wallet View Coming Soon</div>}
      />

      <Route path="readonly" element={<AddReadOnlyAddressView />} />
    </Routes>
  );
}
