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
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { PageLayout } from '../layout';
import { SetPassword } from '../password';
import { Success } from '../success';
import { PannelRight } from '../success/pannel-right';
import { BackupPhrase } from './backup-phrase';
import { useCreateWallet } from './create-context';
import { Processing } from './processing';
import { SelectEcosystem } from './select-ecosystem';

export type PageMetadata = {
  onBack?: () => void;
  backIconType?: 'arrow' | 'close';
};

export function CreateRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetContext, setPassword } = useCreateWallet();
  const [isInterruptOpen, setIsInterruptOpen] = useState(false);
  const [pageMetadata, setPageMetadata] = useState<PageMetadata | null>(null);

  const isBackupStep = location.pathname.includes('/backup');
  const isSuccessStep = location.pathname.includes('/success');

  const currentStep = location.pathname.includes('/ecosystem')
    ? 2
    : isBackupStep || isSuccessStep
    ? undefined
    : 1;

  const totalSteps = isBackupStep || isSuccessStep ? undefined : 2;

  const handleBack = useCallback(() => {
    if (pageMetadata?.onBack) {
      pageMetadata.onBack();
      return;
    }
    if (isBackupStep) {
      setIsInterruptOpen(true);
    } else {
      navigate(-1);
    }
  }, [isBackupStep, navigate, pageMetadata]);

  const handleInterrupt = useCallback(() => {
    setIsInterruptOpen(false);
    resetContext();
    navigate('/onboarding/welcome');
  }, [navigate, resetContext]);

  const activeBackIconType = pageMetadata?.backIconType
    ? pageMetadata.backIconType
    : isBackupStep
    ? 'close'
    : 'arrow';

  return (
    <>
      <PageLayout
        currentStep={isSuccessStep ? undefined : currentStep}
        totalSteps={isSuccessStep ? undefined : totalSteps}
        onBack={isSuccessStep ? undefined : handleBack}
        backIconType={isSuccessStep ? undefined : activeBackIconType}
        customRightPanel={isSuccessStep ? <PannelRight /> : undefined}
      >
        <Routes>
          <Route
            path="password"
            element={<SetPassword savePassword={setPassword} />}
          />
          <Route path="ecosystem" element={<SelectEcosystem />} />
          <Route
            path="backup"
            element={<BackupPhrase setPageMetadata={setPageMetadata} />}
          />
          <Route path="processing" element={<Processing />} />
          <Route path="success" element={<Success />} />
          <Route path="*" element={<Navigate to="password" replace />} />
        </Routes>
      </PageLayout>

      <Dialog open={isInterruptOpen} onOpenChange={setIsInterruptOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Interrupt the Process
            </DialogTitle>
            <DialogDescription className="text-base">
              If you interrupt the process you will lose the current progress of
              wallet creation.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 inline-flex flex-row gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsInterruptOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleInterrupt}
            >
              Interrupt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
