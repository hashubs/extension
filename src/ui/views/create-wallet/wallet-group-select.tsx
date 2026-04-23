import { isMnemonicContainer } from '@/shared/types/validators';
import { Header } from '@/ui/components/header';
import { WalletGroupCollapsible } from '@/ui/components/wallet';
import { useWalletGroups } from '@/ui/hooks/request/internal/useWallet';
import { Button, Card, CardItem } from '@/ui/ui-kit';
import { useMemo } from 'react';
import { IoAddOutline } from 'react-icons/io5';
import { LuChevronRight } from 'react-icons/lu';

export function WalletGroupSelectView({
  onBack,
  onAddWallet,
  onAddNewPhrase,
}: {
  onBack: () => void;
  onAddWallet: (groupId: string) => void;
  onAddNewPhrase: () => void;
}) {
  const { data: walletGroups } = useWalletGroups();

  const mnemonicGroups = useMemo(
    () =>
      walletGroups?.filter((group) =>
        isMnemonicContainer(group.walletContainer)
      ) || [],
    [walletGroups]
  );

  return (
    <div className="flex flex-col h-full">
      <Header title="Select Wallet Group" onBack={onBack} />

      <div className="flex-1 p-4 pt-0 space-y-4 no-scrollbar overflow-y-auto">
        <div className="px-1 text-xs font-bold uppercase tracking-widest text-muted-foreground/80 mb-2">
          Your Recovery Phrases
        </div>

        <div className="space-y-2">
          {mnemonicGroups.map((group, i) => (
            <WalletGroupCollapsible
              key={group.id}
              group={group}
              index={i}
              hiddenBackup
              footer={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddWallet(group.id);
                  }}
                >
                  Add New Wallet
                </Button>
              }
            />
          ))}
        </div>

        <Card>
          <CardItem
            item={{
              label: 'New Recovery Phrase',
              icon: IoAddOutline,
              iconRight: LuChevronRight,
              onClick: onAddNewPhrase,
            }}
          />
        </Card>
      </div>
    </div>
  );
}
