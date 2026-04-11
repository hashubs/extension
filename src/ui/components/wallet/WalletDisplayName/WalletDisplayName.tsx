import { ExternallyOwnedAccount } from '@/background/wallet/model/account-container';
import { useProfileName } from '@/ui/hooks/request/internal/useProfileName';
import { cn } from '@/ui/lib/utils';
import React from 'react';

export function WalletDisplayName({
  wallet,
  padding,
  maxCharacters,
  render,
  className,
}: {
  wallet?: ExternallyOwnedAccount | null;
  padding?: number;
  maxCharacters?: number;
  render?: (data: ReturnType<typeof useProfileName>) => React.ReactNode;
  className?: string;
}) {
  const data = useProfileName(wallet, {
    padding,
    maxCharacters,
  });

  if (render) {
    return render(data);
  }

  return <span className={cn(className)}>{data.value}</span>;
}
