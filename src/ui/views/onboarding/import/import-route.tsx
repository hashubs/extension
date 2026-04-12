
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/ui-kit';
import { useCallback, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { PageLayout } from '../layout';
import { SetPassword } from '../password';
import { Success } from '../success';
import { PannelRight } from '../success/pannel-right';
import { useImportWallet } from './import-context';
import { ImportMnemonic } from './import-mnemonic';
import { ImportPrivateKey } from './import-private-key';
import { Processing } from './processing';
import { SelectWallets } from './select-wallets';
import { TypeSelector } from './type-selector';

import { ONBOARDING_ROUTES } from '../routes';

export function ImportRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetContext, setPassword } = useImportWallet();
  const [isInterruptOpen, setIsInterruptOpen] = useState(false);

  const isTypeSelector =
    location.pathname.endsWith(`/${ONBOARDING_ROUTES.IMPORT.ROOT}`) ||
    location.pathname.endsWith(`/${ONBOARDING_ROUTES.IMPORT.ROOT}/`);
  const isSelectStep = location.pathname.includes(
    `/${ONBOARDING_ROUTES.IMPORT.SELECT_WALLETS}`
  );
  const isPasswordStep = location.pathname.includes(
    `/${ONBOARDING_ROUTES.IMPORT.PASSWORD}`
  );
  const isSuccessStep = location.pathname.includes(
    `/${ONBOARDING_ROUTES.IMPORT.SUCCESS}`
  );

  const currentStep =
    isSuccessStep || isTypeSelector
      ? undefined
      : isPasswordStep
      ? 3
      : isSelectStep
      ? 2
      : 1;
  const totalSteps = isSuccessStep || isTypeSelector ? undefined : 3;

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleInterrupt = useCallback(() => {
    setIsInterruptOpen(false);
    resetContext();
    navigate(`../../${ONBOARDING_ROUTES.WELCOME}`);
  }, [navigate, resetContext]);

  return (
    <>
      <PageLayout
        currentStep={isSuccessStep ? undefined : currentStep}
        totalSteps={isSuccessStep ? undefined : totalSteps}
        onBack={isSuccessStep ? undefined : handleBack}
        customRightPanel={isSuccessStep ? <PannelRight /> : undefined}
      >
        <div className="w-full h-full relative">
          <Routes>
            <Route
              index
              element={<TypeSelector />}
            />
            <Route
              path={ONBOARDING_ROUTES.IMPORT.PHRASE}
              element={<ImportMnemonic />}
            />
            <Route
              path={ONBOARDING_ROUTES.IMPORT.PRIVATE_KEY}
              element={<ImportPrivateKey />}
            />
            <Route
              path={ONBOARDING_ROUTES.IMPORT.PASSWORD}
              element={
                <SetPassword
                  savePassword={setPassword}
                  nextPath={`../${ONBOARDING_ROUTES.IMPORT.PROCESSING}`}
                />
              }
            />
            <Route
              path={ONBOARDING_ROUTES.IMPORT.SELECT_WALLETS}
              element={<SelectWallets />}
            />
            <Route
              path={ONBOARDING_ROUTES.IMPORT.PROCESSING}
              element={<Processing />}
            />
            <Route
              path={ONBOARDING_ROUTES.IMPORT.SUCCESS}
              element={<Success />}
            />
          </Routes>
        </div>
      </PageLayout>

      <Dialog open={isInterruptOpen} onOpenChange={setIsInterruptOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Cancel Import
            </DialogTitle>
            <DialogDescription className="text-base">
              If you cancel now, your progress will be lost and you will need to
              start over.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsInterruptOpen(false)}
            >
              Stay
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleInterrupt}
            >
              Cancel Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
