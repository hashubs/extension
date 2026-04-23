import { wait } from '@/shared/wait';
import { Header } from '@/ui/components/header';
import {
  GroupImportDecoration,
  ImportBackground,
} from '@/ui/components/wallet';
import { useWalletGroupByGroupId } from '@/ui/hooks/request/internal/useWallet';
import { Button } from '@/ui/ui-kit';
import { useEffect, useState } from 'react';

export function SuccessVerifyView({
  groupId,
  onBack,
}: {
  groupId: string | null;
  onBack: () => void;
}) {
  const { data: group, isLoading: isGroupLoading } = useWalletGroupByGroupId({
    groupId: groupId || '',
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Small delay to make the process feel "real" and show the loading state
      await wait(1500);
      setIsReady(true);
    };
    init();
  }, []);

  const isLoading = isGroupLoading || !isReady;

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      <Header
        title={isReady ? 'Backup Completed' : 'Verifying...'}
        onBack={onBack}
      />
      <div className="flex-1 p-4 relative flex flex-col items-center">
        <div className="absolute inset-0 pointer-events-none">
          <ImportBackground animate={isLoading} />
        </div>

        <div className="flex-1 w-full z-10">
          <GroupImportDecoration
            groupName={group?.name || 'My Wallet'}
            isLoading={isLoading}
            loadingTitle="Finalizing backup..."
          />
        </div>

        {isReady && (
          <div className="mt-auto w-full space-y-4 z-10 animate-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold">Successfully Verified!</h2>
              <p className="text-sm text-muted-foreground">
                Your recovery phrase has been verified and your backup is
                up-to-date.
              </p>
            </div>

            <Button variant="primary" size="md" onClick={onBack}>
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
