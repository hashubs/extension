import { invariant } from '@/shared/invariant';
import { VerifyUserView } from '@/ui/components/verify-user';
import { useCallback } from 'react';
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { REVEAL_PK_ROUTES, REVEAL_PK_STEPS } from './constants';
import { RevealPrivateKeyView } from './reveal-private-key';

export function RevealPrivateKeyRoutes() {
  const [params] = useSearchParams();
  const location = useLocation();
  const groupId = params.get('groupId');
  const address = params.get('address');
  invariant(groupId, 'groupId param is required for RevealPrivateKeyView');
  invariant(address, 'address param is required for RevealPrivateKeyView');

  const navigate = useNavigate();

  const onBack = useCallback(
    () =>
      navigate(
        `/settings/manage-wallets/accounts/${address}?groupId=${groupId}`,
        {
          replace: true,
          state: { direction: 'back' },
        }
      ),
    [navigate, address, groupId]
  );

  const onSessionExpired = useCallback(
    () =>
      navigate(`${REVEAL_PK_ROUTES.ROOT}${location.search}`, {
        replace: true,
      }),
    [navigate, location.search]
  );

  return (
    <Routes>
      <Route
        path="/"
        element={
          <VerifyUserView
            text="Your password is required to reveal the private key."
            buttonTitle="Continue"
            onBack={onBack}
            onSuccess={() =>
              navigate(`${REVEAL_PK_ROUTES.VIEW}${location.search}`, {
                replace: true,
                state: { direction: 'forward' },
              })
            }
          />
        }
      />
      <Route
        path={REVEAL_PK_STEPS.VIEW}
        element={
          <RevealPrivateKeyView
            groupId={groupId}
            address={address}
            onBack={onBack}
            onSessionExpired={onSessionExpired}
          />
        }
      />
    </Routes>
  );
}
