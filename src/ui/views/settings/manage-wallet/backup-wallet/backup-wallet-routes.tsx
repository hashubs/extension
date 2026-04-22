import { walletPort } from '@/shared/channel';
import { invariant } from '@/shared/invariant';
import { isSessionExpiredError } from '@/shared/isSessionExpiredError';
import { queryClient } from '@/shared/query-client/queryClient';
import { VerifyUserView } from '@/ui/components/verify-user/verify-user';
import { QUERY_WALLET } from '@/ui/hooks/request/internal/useWallet';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { Route, Routes, useNavigate, useSearchParams } from 'react-router-dom';
import { MnemonicDisplayView } from './mnemonic-display';
import { SuccessVerifyView } from './success-verify';
import { VerifyMnemonicView } from './verify-mnemonic';

export function BackupWalletRoutes() {
  const [params] = useSearchParams();
  const groupId = params.get('groupId');
  const needsBackup = params.get('needsBackup') === 'true';
  invariant(groupId, 'groupId param is required for BackupPage');

  const buildSearchParams = () => {
    const params = new URLSearchParams({ groupId });
    if (needsBackup) params.set('needsBackup', 'true');
    return `?${params}`;
  };

  const searchParams = groupId ? buildSearchParams() : '';

  const navigate = useNavigate();

  const goToVerifyUser = useCallback(
    () =>
      navigate(`/settings/manage-wallets/groups/${groupId}`, {
        replace: true,
      }),
    [navigate, groupId]
  );

  const { mutate: handleSuccess } = useMutation({
    mutationFn: () => walletPort.request('updateLastBackedUp', { groupId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_WALLET.walletGroups });
      navigate(`/settings/manage-wallets/backup/success?groupId=${groupId}`, {
        replace: true,
      });
    },
    onError: (error: unknown) => {
      if (isSessionExpiredError(error)) {
        goToVerifyUser();
      }
    },
  });

  return (
    <Routes>
      <Route
        path="/verify-user"
        element={
          <VerifyUserView
            text="Recovery phrase will be encrypted with your password"
            buttonTitle="Continue"
            onBack={() =>
              navigate(`/settings/manage-wallets/groups/${groupId}`, {
                state: { direction: 'back' },
              })
            }
            onSuccess={() =>
              navigate(
                `/settings/manage-wallets/backup/mnemonic${searchParams}`,
                { replace: true, state: { direction: 'forward' } }
              )
            }
          />
        }
      />
      <Route
        path="/mnemonic"
        element={
          <MnemonicDisplayView
            groupId={groupId}
            needsBackup={needsBackup}
            onNextStep={() =>
              navigate(
                `/settings/manage-wallets/backup/verify-mnemonic${searchParams}`,
                { state: { direction: 'forward' } }
              )
            }
            onSessionExpired={goToVerifyUser}
            onBack={() =>
              navigate(`/settings/manage-wallets/groups/${groupId}`, {
                state: { direction: 'back' },
              })
            }
          />
        }
      />
      <Route
        path="/verify-mnemonic"
        element={
          <VerifyMnemonicView
            groupId={groupId}
            onSuccess={handleSuccess}
            onSessionExpired={goToVerifyUser}
            onBack={() =>
              navigate(
                `/settings/manage-wallets/backup/mnemonic${searchParams}`,
                { state: { direction: 'back' } }
              )
            }
          />
        }
      />

      <Route
        path="/success"
        element={
          <SuccessVerifyView
            groupId={groupId}
            onBack={() =>
              navigate(`/settings/manage-wallets/groups/${groupId}`, {
                state: { direction: 'back' },
              })
            }
          />
        }
      />
    </Routes>
  );
}
