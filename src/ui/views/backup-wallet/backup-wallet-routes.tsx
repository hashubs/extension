import { walletPort } from '@/shared/channel';
import { invariant } from '@/shared/invariant';
import { isSessionExpiredError } from '@/shared/isSessionExpiredError';
import { queryClient } from '@/shared/query-client/queryClient';
import { VerifyUserView } from '@/ui/components/verify-user';
import { QUERY_WALLET } from '@/ui/hooks/request/internal/useWallet';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { BACKUP_WALLET_ROUTES, BACKUP_WALLET_STEPS } from './constants';
import { MnemonicDisplayView } from './mnemonic-display';
import { SuccessVerifyView } from './success-verify';
import { VerifyMnemonicView } from './verify-mnemonic';

export function BackupWalletRoutes() {
  const [params] = useSearchParams();
  const location = useLocation();
  const groupId = params.get('groupId');
  const needsBackup = params.get('needsBackup') === 'true';
  invariant(groupId, 'groupId param is required for BackupPage');

  const navigate = useNavigate();

  const onBack = useCallback(() => {
    navigate(`/settings/manage-wallets/groups/${groupId}`, {
      replace: true,
      state: { direction: 'back' },
    });
  }, [navigate, groupId]);

  const onSessionExpired = useCallback(
    () =>
      navigate(`${BACKUP_WALLET_ROUTES.ROOT}${location.search}`, {
        replace: true,
      }),
    [navigate, location.search]
  );

  const { mutate: handleSuccess } = useMutation({
    mutationFn: () => walletPort.request('updateLastBackedUp', { groupId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_WALLET.walletGroups });
      queryClient.invalidateQueries({
        queryKey: QUERY_WALLET.walletGroup(groupId),
      });
      navigate(`${BACKUP_WALLET_ROUTES.SUCCESS}${location.search}`, {
        replace: true,
      });
    },
    onError: (error: unknown) => {
      if (isSessionExpiredError(error)) {
        onSessionExpired();
      }
    },
  });

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
              navigate(`${BACKUP_WALLET_ROUTES.MNEMONIC}${location.search}`, {
                replace: true,
                state: { direction: 'forward' },
              })
            }
          />
        }
      />
      <Route
        path={BACKUP_WALLET_STEPS.MNEMONIC}
        element={
          <MnemonicDisplayView
            groupId={groupId}
            needsBackup={needsBackup}
            onNextStep={() =>
              navigate(`${BACKUP_WALLET_ROUTES.VERIFY}${location.search}`, {
                state: { direction: 'forward' },
              })
            }
            onSessionExpired={onSessionExpired}
            onBack={onBack}
          />
        }
      />
      <Route
        path={BACKUP_WALLET_STEPS.VERIFY}
        element={
          <VerifyMnemonicView
            groupId={groupId}
            onSuccess={handleSuccess}
            onSessionExpired={onSessionExpired}
            onBack={() =>
              navigate(`${BACKUP_WALLET_ROUTES.MNEMONIC}${location.search}`, {
                state: { direction: 'back' },
              })
            }
          />
        }
      />

      <Route
        path={BACKUP_WALLET_STEPS.SUCCESS}
        element={<SuccessVerifyView groupId={groupId} onBack={onBack} />}
      />
    </Routes>
  );
}
