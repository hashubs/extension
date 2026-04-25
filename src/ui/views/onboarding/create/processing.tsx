import { walletPort } from '@/shared/channels';
import { isSessionExpiredError } from '@/shared/isSessionExpiredError';
import { getWalletGroupByAddress } from '@/shared/request/internal/getWalletGroupByAddress';
import { wait } from '@/shared/wait';
import { Processing as ProcessingComponent } from '@/ui/components/processing';
import { Button } from '@/ui/ui-kit';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { MdErrorOutline } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import { ONBOARDING_ROUTES } from '../routes';
import { ensurePendingWalletAndUser } from './backup-phrase';

export function Processing() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showError, setShowError] = useState(false);
  const mounted = useRef(false);

  const { isBackedUp } = (location.state as { isBackedUp?: boolean }) || {};

  const { mutate: createUserAndWallet } = useMutation({
    mutationFn: async () => {
      setShowError(false);

      const wallet = await ensurePendingWalletAndUser();

      if (isBackedUp) {
        const group = await getWalletGroupByAddress(wallet.address);
        if (group?.id) {
          await walletPort.request('updateLastBackedUp', {
            groupId: group.id,
          });
        }
      }

      await wait(1000);
    },
    onSuccess: () => {
      navigate(`../${ONBOARDING_ROUTES.SUCCESS}`, { replace: true });
    },
    onError: (error) => {
      console.error('Failed to process wallet creation:', error);
      if (isSessionExpiredError(error)) {
        navigate(`../../${ONBOARDING_ROUTES.SESSION_EXPIRED}`, {
          replace: true,
        });
        return;
      }
      setShowError(true);
    },
  });

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      createUserAndWallet();
    }
  }, [createUserAndWallet]);

  if (showError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 w-full max-w-md mx-auto text-center">
        <MdErrorOutline className="text-negative-500 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-on-surface mb-2">
          Creation Failed
        </h2>
        <p className="text-on-surface-variant mb-8 leading-relaxed">
          We encountered an error while securing your new wallet. Please try
          again or go back to start over.
        </p>
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() =>
            navigate(`../${ONBOARDING_ROUTES.CREATE.PASSWORD}`, {
              replace: true,
            })
          }
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <ProcessingComponent
      title="Creating your wallet"
      description="Please wait while we secure your wallet and save your preferences..."
    />
  );
}
