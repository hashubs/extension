import { BareWallet, MaskedBareWallet } from '@/shared/types/bare-wallet';
import { ImportBackground, ImportDecoration } from '@/ui/components/wallet';
import { Button } from '@/ui/ui-kit';
import { useEffect, useRef } from 'react';
import { Footer, Layout } from '../layout';

export interface WalletSetupStatusViewProps {
  title: string;
  loadingTitle?: string;
  successTitle?: string;
  successDescription?: string;
  wallets: MaskedBareWallet[] | BareWallet[];
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: Error | null;
  onBack: () => void;
  onContinue: () => void;
  buttonText?: string;
}

export function WalletSetupStatusView({
  title,
  loadingTitle = 'Importing wallets',
  successTitle = 'Successfully Created!',
  successDescription = 'Your new recovery phrase is securely encrypted and stored.',
  wallets,
  isPending,
  isSuccess,
  isError,
  error,
  onBack,
  onContinue,
  buttonText = 'View Wallets',
}: WalletSetupStatusViewProps) {
  const autoFocusRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => autoFocusRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  return (
    <Layout
      title={isPending ? 'Processing...' : isSuccess ? 'Success' : title}
      onBack={onBack}
      wrapped={false}
    >
      <div className="relative flex flex-col flex-1 justify-center items-center">
        <div className="absolute inset-0 pointer-events-none">
          <ImportBackground animate={isPending} />
        </div>

        <div className="flex-1 w-full z-10">
          <ImportDecoration
            wallets={wallets}
            isLoading={isPending}
            loadingTitle={loadingTitle}
          />
        </div>

        {isError && error ? (
          <div className="text-sm text-destructive text-center z-10 p-4 bg-destructive/10 rounded-lg animate-in fade-in zoom-in-95">
            {error.message}
          </div>
        ) : null}
      </div>

      {isSuccess && (
        <Footer className="w-full animate-in slide-in-from-bottom-4 duration-700">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-semibold">{successTitle}</h2>
            <p className="text-sm text-muted-foreground">
              {successDescription}
            </p>
          </div>

          <Button
            ref={autoFocusRef}
            size="md"
            variant="primary"
            onClick={onContinue}
            className="w-full"
          >
            {buttonText}
          </Button>
        </Footer>
      )}
    </Layout>
  );
}

// Keep the old name for backward compatibility if needed, but it's now just a wrapper or we update the references.
// For now, I'll export it as a separate component and we'll update the callers.
export { WalletSetupStatusView as WalletSuccessView };
