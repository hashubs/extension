import { ErrorBoundary } from '@/ui/components/ErrorBoundary/ErrorBoundary';
import { Processing as ScanningWallet } from '@/ui/components/processing';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/ui-kit';
import { Suspense, useCallback, useState } from 'react';
import { MdErrorOutline } from 'react-icons/md';
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

export function ImportRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetContext, setPassword } = useImportWallet();
  const [isInterruptOpen, setIsInterruptOpen] = useState(false);

  const isTypeSelector =
    location.pathname === '/onboarding/import' ||
    location.pathname === '/onboarding/import/';
  const isSelectStep = location.pathname.includes('/select-wallets');
  const isPasswordStep = location.pathname.includes('/password');
  const isSuccessStep = location.pathname.includes('/success');

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
    navigate('/onboarding/welcome');
  }, [navigate, resetContext]);

  return (
    <>
      <PageLayout
        currentStep={isSuccessStep ? undefined : currentStep}
        totalSteps={isSuccessStep ? undefined : totalSteps}
        onBack={isSuccessStep ? undefined : handleBack}
        customRightPanel={isSuccessStep ? <PannelRight /> : undefined}
      >
        <ErrorBoundary
          renderError={(error) => (
            <div className="flex flex-col items-center justify-center p-8 w-full max-w-md mx-auto text-center">
              <MdErrorOutline className="text-negative-500 mb-4" size={64} />
              <h2 className="text-2xl font-bold text-on-surface mb-2">
                Something went wrong
              </h2>
              <p className="text-on-surface-variant mb-8 leading-relaxed">
                {error?.message ??
                  'An unexpected error occurred. Please try again.'}
              </p>
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() =>
                  navigate('/onboarding/welcome', { replace: true })
                }
              >
                Back to Home
              </Button>
            </div>
          )}
        >
          <Routes>
            <Route index element={<TypeSelector />} />
            <Route path="phrase" element={<ImportMnemonic />} />
            <Route path="private-key" element={<ImportPrivateKey />} />
            <Route
              path="password"
              element={
                <SetPassword
                  savePassword={setPassword}
                  nextPath="../processing"
                />
              }
            />
            <Route
              path="select-wallets"
              element={
                <Suspense
                  fallback={
                    <ScanningWallet
                      title="Scanning your wallets"
                      description="Please wait while we scan your wallets..."
                    />
                  }
                >
                  <SelectWallets />
                </Suspense>
              }
            />
            <Route path="processing" element={<Processing />} />
            <Route path="success" element={<Success />} />
          </Routes>
        </ErrorBoundary>
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
