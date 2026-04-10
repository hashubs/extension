import { ExternallyOwnedAccount } from '@/background/wallet/model/account-container';
import { useProfileName } from '@/ui/hooks/request/internal/useProfileName';
import React from 'react';

export function WalletDisplayName({
  wallet,
  padding,
  maxCharacters,
  render,
}: {
  wallet: ExternallyOwnedAccount;
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
  return <span style={{ wordBreak: 'break-all' }}>{data.value}</span>;
}
