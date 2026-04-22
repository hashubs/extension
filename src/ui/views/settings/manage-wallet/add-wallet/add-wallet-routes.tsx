import { invariant } from '@/shared/invariant';
import { VerifyUserView } from '@/ui/components/verify-user';
import { useCallback, useState } from 'react';
import { Route, Routes, useNavigate, useSearchParams } from 'react-router-dom';
import { AddWalletDiscoveryView } from './add-wallet-discovery';
import { AddWalletScanView } from './add-wallet-scan';
import { AddWalletSuccessView } from './add-wallet-success';
import { MemoryLocationState } from './memoryLocationState';

export function AddWalletRoutes() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const groupId = params.get('groupId');
  invariant(groupId, 'groupId param is required for AddWalletPage');

  const [memoryLocationState] = useState(() => new MemoryLocationState({}));

  const goToVerifyUser = useCallback(() => {
    navigate(`/settings/manage-wallets/add-wallet?groupId=${groupId}`, {
      replace: true,
    });
  }, [navigate, groupId]);

  const onBackToGroup = useCallback(() => {
    navigate(`/settings/manage-wallets/groups/${groupId}`, {
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
            onBack={onBackToGroup}
            onSuccess={() =>
              navigate(
                `/settings/manage-wallets/add-wallet/scan?groupId=${groupId}`,
                {
                  replace: true,
                  state: { direction: 'forward' },
                }
              )
            }
          />
        }
      />
      <Route
        path="/scan"
        element={
          <AddWalletScanView
            locationStateStore={memoryLocationState}
            onSessionExpired={goToVerifyUser}
            onNextStep={() =>
              navigate(
                `/settings/manage-wallets/add-wallet/discovery?groupId=${groupId}`,
                {
                  replace: true,
                  state: { direction: 'forward' },
                }
              )
            }
          />
        }
      />
      <Route
        path="/discovery"
        element={
          <AddWalletDiscoveryView
            locationStateStore={memoryLocationState}
            onBack={onBackToGroup}
            onSuccess={(selectedWallets) =>
              navigate(
                `/settings/manage-wallets/add-wallet/success?groupId=${groupId}`,
                {
                  replace: true,
                  state: { values: selectedWallets },
                }
              )
            }
            onSessionExpired={goToVerifyUser}
          />
        }
      />
      <Route
        path="/success"
        element={
          <AddWalletSuccessView
            onBack={onBackToGroup}
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
