import { WalletGroup } from '@/background/wallet/model/types';
import { WalletOrigin } from '@/background/wallet/model/wallet-origin';
import {
  isHardwareContainer,
  isMnemonicContainer,
} from '@/shared/types/validators';

export function needsBackup(group: WalletGroup) {
  return (
    isMnemonicContainer(group.walletContainer) &&
    group.origin === WalletOrigin.extension &&
    group.lastBackedUp == null
  );
}

export function BackupInfoNote({ group }: { group: WalletGroup }) {
  const isHardware = isHardwareContainer(group.walletContainer);

  if (group.lastBackedUp != null) {
    return (
      <span className="text-xs text-neutral-400 dark:text-neutral-600">
        Last Backup:{' '}
        {new Intl.DateTimeFormat('en-US', {
          dateStyle: 'medium',
        }).format(new Date(group.lastBackedUp))}
      </span>
    );
  }

  if (group.origin === WalletOrigin.extension) {
    return (
      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
        <span className="text-xs font-medium">Never backed up</span>
      </div>
    );
  }

  if (group.origin === WalletOrigin.imported) {
    return (
      <span className="text-xs text-neutral-400 dark:text-neutral-600">
        {isHardware ? 'Connected' : 'Imported'} on{' '}
        {new Intl.DateTimeFormat('en-US', {
          dateStyle: 'medium',
        }).format(new Date(group.created))}
      </span>
    );
  }

  return null;
}
