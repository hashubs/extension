import { invariant } from '@/shared/invariant';
import { VerifyUserView } from '@/ui/components/verify-user';
import { MemoryLocationState } from '@/ui/shared/memoryLocationState';
import { useCallback, useState } from 'react';
import { Route, Routes, useNavigate, useSearchParams } from 'react-router-dom';

import {
  WalletDiscoveryView,
  WalletScanView,
  WalletSuccessView,
} from '@/ui/components/wallet-setup';
import { ADD_WALLET_ROUTES, ADD_WALLET_STEPS } from './constants';

export function AddWalletRoutes() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const groupId = params.get('groupId');
  invariant(groupId, 'groupId param is required for AddWalletPage');

  const [memoryLocationState] = useState(() => new MemoryLocationState({}));

  const goToVerifyUser = useCallback(() => {
    navigate(`${ADD_WALLET_ROUTES.ROOT}?groupId=${groupId}`, {
      replace: true,
    });
  }, [navigate, groupId]);

  const onBack = useCallback(() => {
    navigate(`/settings/manage-wallets/groups/${groupId}`, {
      replace: true,
      state: { direction: 'back' },
    });
  }, [navigate, groupId]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <VerifyUserView
            text="Recovery phrase will be encrypted with your password"
            buttonTitle="Continue"
            onBack={onBack}
            onSuccess={() =>
              navigate(`${ADD_WALLET_ROUTES.SCAN}?groupId=${groupId}`, {
                replace: true,
                state: { direction: 'forward' },
              })
            }
          />
        }
      />
      <Route
        path={ADD_WALLET_STEPS.SCAN}
        element={
          <WalletScanView
            locationStateStore={memoryLocationState}
            onSessionExpired={goToVerifyUser}
            onNextStep={() =>
              navigate(`${ADD_WALLET_ROUTES.DISCOVERY}?groupId=${groupId}`, {
                replace: true,
                state: { direction: 'forward' },
              })
            }
          />
        }
      />
      <Route
        path={ADD_WALLET_STEPS.DISCOVERY}
        element={
          <WalletDiscoveryView
            locationStateStore={memoryLocationState}
            onBack={onBack}
            onSuccess={(selectedWallets) =>
              navigate(`${ADD_WALLET_ROUTES.SUCCESS}?groupId=${groupId}`, {
                replace: true,
                state: { values: selectedWallets },
              })
            }
            onSessionExpired={goToVerifyUser}
          />
        }
      />
      <Route
        path={ADD_WALLET_STEPS.SUCCESS}
        element={
          <WalletSuccessView
            onBack={onBack}
            onSessionExpired={goToVerifyUser}
            onSuccess={() =>
              navigate('/overview', {
                replace: true,
                state: { direction: 'back' },
              })
            }
          />
        }
      />
    </Routes>
  );
}
