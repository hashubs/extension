import { ExternallyOwnedAccount } from '@/shared/types/externally-owned-account';
import { useProfileName } from '@/ui/hooks/request/internal/useProfileName';
import React from 'react';

export function WalletDisplayName({
  wallet,
  padding,
  maxCharacters,
  render,
}: {
  wallet: ExternallyOwnedAccount | null | undefined;
  padding?: number;
  maxCharacters?: number;
  render?: (data: ReturnType<typeof useProfileName>) => React.ReactNode;
}) {
  const data = useProfileName(wallet, {
    padding,
    maxCharacters,
  });

  if (render) {
    return render(data);
  }

  return data.value;
}
