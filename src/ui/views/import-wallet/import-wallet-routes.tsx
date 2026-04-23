import { VerifyUserView } from '@/ui/components/verify-user';
import { MemoryLocationState } from '@/ui/shared/memoryLocationState';
import { useCallback } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { AddReadOnlyAddressView } from './add-read-only-address';
import { IMPORT_ROUTES, MNEMONIC_STEPS } from './constants';
import { ImportWalletView } from './import-wallet';

import {
  WalletDiscoveryView,
  WalletScanView,
  WalletSuccessView,
} from '@/ui/components/wallet-setup';

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
      <Route
        path="/"
        element={
          <ImportWalletView locationStateStore={globalMemoryLocationState} />
        }
      />

      <Route path="mnemonic">
        <Route
          path={MNEMONIC_STEPS.VERIFY}
          element={
            <VerifyUserView
              text="Recovery phrase will be encrypted with your password"
              buttonTitle="Continue"
              onBack={() => navigate(IMPORT_ROUTES.ROOT)}
              onSuccess={() =>
                navigate(
                  `${IMPORT_ROUTES.MNEMONIC}/${MNEMONIC_STEPS.SCAN}?state=memory`,
                  { replace: true }
                )
              }
            />
          }
        />
        <Route
          path={MNEMONIC_STEPS.SCAN}
          element={
            <WalletScanView
              locationStateStore={globalMemoryLocationState}
              onSessionExpired={handleSessionExpired}
              onNextStep={() =>
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
              onBack={() =>
                navigate(
                  `${IMPORT_ROUTES.MNEMONIC}/${MNEMONIC_STEPS.SCAN}?state=memory`
                )
              }
              onSessionExpired={handleSessionExpired}
              onSuccess={(selectedWallets) =>
                navigate(
                  `${IMPORT_ROUTES.MNEMONIC}/${MNEMONIC_STEPS.SUCCESS}`,
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
          path={MNEMONIC_STEPS.SUCCESS}
          element={
            <WalletSuccessView
              onBack={() =>
                navigate(
                  `${IMPORT_ROUTES.MNEMONIC}/${MNEMONIC_STEPS.DISCOVERY}`
                )
              }
              onSessionExpired={handleSessionExpired}
              onSuccess={handleFinish}
            />
          }
        />
      </Route>

      <Route
        path="private-key"
        element={<div>Private Key View Coming Soon</div>}
      />

      <Route
        path="hardware"
        element={<div>Hardware Wallet View Coming Soon</div>}
      />

      <Route path="readonly" element={<AddReadOnlyAddressView />} />
    </Routes>
  );
}
