import { reloadActiveTab } from '@/shared/reloadActiveTab';
import { WalletNameFlag } from '@/shared/types/wallet-name-flag';
import { useWalletNameFlags } from '@/ui/hooks/request/internal/useWalletNameFlags';
import { Card, CardItem } from '@/ui/ui-kit';
import MetamaskIcon from 'jsx:@/ui/assets/metamask.svg';
import MetamaskDisabledIcon from 'jsx:@/ui/assets/metamask_disabled.svg';

import { Switch } from 'src/ui/ui-kit/switch';

export function MetamaskMode({
  originName,
  onCheckedChange,
}: {
  originName: string;
  onCheckedChange?: (checked: boolean) => void;
}) {
  const { setWalletNameFlags, isMetaMask } = useWalletNameFlags(originName);

  const handleToggle = () => {
    setWalletNameFlags
      .mutateAsync({
        flag: WalletNameFlag.isMetaMask,
        checked: !isMetaMask,
      })
      .then(() => {
        onCheckedChange?.(!isMetaMask);
        reloadActiveTab();
      });
  };

  return (
    <Card className="border border-muted-foreground/10 w-full">
      <CardItem
        item={{
          label: 'MetaMask Mode',
          subLabel: 'Enable if Dapp only works with MetaMask',
          icon: isMetaMask ? MetamaskIcon : MetamaskDisabledIcon,
          onClick: handleToggle,
          rightElement: (
            <Switch checked={isMetaMask} onCheckedChange={handleToggle} />
          ),
        }}
      />
    </Card>
  );
}
