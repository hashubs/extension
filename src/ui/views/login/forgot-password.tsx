import { EXTENSION } from '@/app/constants';
import { Header } from '@/ui/components/header';
import { Button, Sheet, SheetContent } from '@/ui/ui-kit';
import { LuLoader } from 'react-icons/lu';

interface ForgotPasswordComponentProps {
  open: boolean;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ForgotPassword({
  open,
  loading,
  onOpenChange,
  onConfirm,
}: ForgotPasswordComponentProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="border-none">
        <Header title="Forgot password?" onBack={() => onOpenChange(false)} />

        <div className="space-y-2">
          <p className="text-muted-foreground">
            If you forget your password, you need to delete all wallets in
            {EXTENSION.name}, and then you can reset your password.
          </p>

          <p className="text-muted-foreground">
            Make sure you have backed up the 12-word or 24-word seed phrase or
            private key. Otherwise, do not delete your wallet.
          </p>
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <LuLoader className="animate-spin" size={18} />
            ) : (
              'Confirm'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
