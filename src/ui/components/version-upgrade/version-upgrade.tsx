import { accountPublicRPCPort } from '@/shared/channels';
import { Button } from '@/ui/ui-kit';
import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { BsDatabaseFillGear } from 'react-icons/bs';
import { LuLoader } from 'react-icons/lu';
import { eraseAndUpdateToLatestVersion } from 'src/shared/core/version/shared';
import { checkVersion } from 'src/shared/core/version/version.client';

export function VersionUpgrade({ children }: React.PropsWithChildren) {
  const { data, refetch } = useQuery({
    queryKey: ['checkVersion'],
    queryFn: () => checkVersion(),
    retry: false,
    refetchOnMount: false,
    staleTime: Infinity,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const [ignoreWarning, setIgnoreWarning] = useState(false);

  const eraseMutation = useMutation({
    mutationFn: async () => {
      await accountPublicRPCPort.request('logout');
      return eraseAndUpdateToLatestVersion();
    },
    onSuccess() {
      refetch();
    },
  });

  if (
    !ignoreWarning &&
    data?.storageVersion.mismatch &&
    data.storageVersion.action === 'clear-storage'
  ) {
    const CAN_LOGIN_TO_OLD_VERSION = false;

    return (
      <div className="flex flex-col h-full items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm flex flex-col gap-6">
          <div className="flex flex-col items-start gap-3">
            <div className="w-13 h-13 rounded-xl border border-muted-foreground/20 bg-muted-foreground/5 flex items-center justify-center text-2xl select-none">
              <BsDatabaseFillGear />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
              <span className="text-xs text-amber-700 font-medium">
                Action required
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-medium leading-snug">
              Data migration needed before you continue
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We've updated how data is stored internally. Your current storage
              format is no longer compatible — a one-time reset is required to
              proceed.
            </p>
          </div>

          <div className="bg-item border border-muted-foreground/20 rounded-lg px-4 py-3.5 flex flex-col gap-2.5">
            <div className="flex items-start gap-2.5">
              <span className="text-sm mt-0.5">🗂️</span>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your existing data will be permanently removed. Make sure you
                have your seed phrase or backup ready before continuing.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-sm mt-0.5">🔑</span>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You will need to re-import your wallet after the reset.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              disabled={eraseMutation.isPending}
              onClick={() => eraseMutation.mutate()}
              loading={eraseMutation.isPending}
              loadingText="Clearing storage..."
              icon={eraseMutation.isPending ? LuLoader : undefined}
            >
              Reset and continue
            </Button>

            {CAN_LOGIN_TO_OLD_VERSION ? (
              <Button variant="outline" onClick={() => setIgnoreWarning(true)}>
                Use old storage to make backups first
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  } else {
    return children as JSX.Element;
  }
}
