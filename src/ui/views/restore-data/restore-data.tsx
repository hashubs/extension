import { walletPort } from '@/shared/channels';
import { openInNewWindow } from '@/shared/open-in-new-window';
import { useToastStore } from '@/shared/store/useToastStore';
import { Button } from '@/ui/ui-kit';
import { useMutation } from '@tanstack/react-query';
import { getError } from 'get-error';
import { PiWarningFill } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';

export function RestoreDataView() {
  const navigate = useNavigate();
  const { show: showToast } = useToastStore();

  const handleRestoreDataMutation = useMutation({
    mutationFn: () => {
      return walletPort.request('restoreBackupData');
    },
    onSuccess: () => {
      navigate('/', { replace: true });
      window.location.reload();
    },
    onError: (error) => {
      showToast(getError(error).message, { variant: 'error' });
    },
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 flex-col items-center justify-center text-center px-4 gap-6">
        <div className="h-9" />

        <div className="flex flex-col items-center gap-2 max-w-sm">
          <PiWarningFill className="w-16 h-16 text-amber-400" />

          <h2 className="text-xl font-medium leading-snug">
            Password update was interrupted
          </h2>

          <p className="text-sm text-muted-foreground leading-relaxed">
            But we've made a backup! Click the button below to restore your
            data.
          </p>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Please use your previous password to restore access to your wallet.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full text-center px-4 pb-2">
        <Button
          disabled={handleRestoreDataMutation.isPending}
          onClick={() => handleRestoreDataMutation.mutate()}
          loading={handleRestoreDataMutation.isPending}
          variant="gradient-teal"
          loadingText="Restoring..."
          shimmer
        >
          Restore data
        </Button>

        <p className="text-sm text-muted-foreground leading-relaxed">
          If the problem persists, please{' '}
          <a
            href="https://help.selvo.io"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              openInNewWindow(e);
            }}
            className="text-teal-600 hover:underline"
          >
            contact our support
          </a>
        </p>
      </div>
    </div>
  );
}
