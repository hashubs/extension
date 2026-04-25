import { Footer, Layout } from '@/ui/components/layout';
import { LayoutHeading } from '@/ui/components/layout/heading';
import { cn } from '@/ui/lib/utils';
import { AnimatedCheckmark, Button, CardItem } from '@/ui/ui-kit';
import { useState } from 'react';
import type { IconType } from 'react-icons';
import { SiEthereum, SiSolana } from 'react-icons/si';
import type { BlockchainType } from 'src/shared/wallet/classifiers';
import EvmChainsImg from 'url:src/ui/assets/evm-chains.png';

type Ecosystem = {
  id: BlockchainType;
  Icon: IconType;
  title: string;
  description: string | undefined;
  className?: string;
};

const ecosystemsList: Ecosystem[] = [
  {
    id: 'evm',
    Icon: SiEthereum,
    title: 'Ethereum Ecosystem',
    description: undefined,
    className: 'bg-[#627eea]',
  },
  {
    id: 'solana',
    Icon: SiSolana,
    title: 'Solana Ecosystem',
    description: 'Fast & low fees',
    className: 'bg-[#9945ff]',
  },
];

export function EcosystemSelectView({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: (ecosystems: BlockchainType[]) => void;
}) {
  const [ecosystems, setEcosystems] = useState<Set<BlockchainType>>(
    new Set(['evm', 'solana'])
  );

  const toggleEcosystem = (id: BlockchainType) => {
    const next = new Set(ecosystems);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setEcosystems(next);
  };

  const allIds = ecosystemsList.map((e) => e.id);
  const allSelected = allIds.every((id) => ecosystems.has(id));

  const toggleAll = () => {
    setEcosystems(allSelected ? new Set() : new Set(allIds));
  };

  const handleNext = () => {
    if (ecosystems.size === 0) return;
    onNext(Array.from(ecosystems));
  };

  return (
    <Layout title="Select Ecosystem" onBack={onBack} wrapped={false}>
      <div className="flex-1 space-y-4">
        <LayoutHeading
          title="Select your ecosystem"
          description="Choose the networks for your new recovery phrase. You can add more later."
        />

        <div className="flex justify-between items-center px-1 shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
            {ecosystems.size} of {ecosystemsList.length} selected
          </span>
          <button
            className="text-[11px] font-bold text-primary transition-opacity duration-200 hover:opacity-70"
            onClick={toggleAll}
          >
            {allSelected ? 'Deselect all' : 'Select all'}
          </button>
        </div>

        <div className="flex flex-col space-y-4 shrink-0">
          {ecosystemsList.map(({ id, ...item }) => {
            const isSelected = ecosystems.has(id);
            return (
              <CardItem
                key={id}
                item={{
                  iconNode: <item.Icon size={20} />,
                  iconClassName: cn(item.className, 'p-1 w-10 h-10'),
                  label: item.title,
                  onClick: () => toggleEcosystem(id),
                  subLabel: id !== 'evm' ? item.description : undefined,
                  className:
                    'px-0 py-0 hover:bg-transparent! dark:hover:bg-transparent!',
                  subLabelElement:
                    id === 'evm' ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <img
                          src={EvmChainsImg}
                          alt="EVM Chains"
                          className="h-4"
                        />
                        <span className="text-[11px] text-muted-foreground/80 font-medium">
                          +60 more
                        </span>
                      </div>
                    ) : undefined,
                  rightElement: (
                    <AnimatedCheckmark
                      animate
                      checked={isSelected}
                      checkedColor="var(--primary)"
                      uncheckedColor="var(--neutral-100)"
                      size={20}
                    />
                  ),
                }}
              />
            );
          })}
        </div>
      </div>
      <Footer>
        <Button
          variant="primary"
          size="md"
          className="w-full"
          disabled={ecosystems.size === 0}
          onClick={handleNext}
        >
          Continue
        </Button>
      </Footer>
    </Layout>
  );
}
