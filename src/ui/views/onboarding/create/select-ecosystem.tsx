import { accountPublicRPCPort, walletPort } from '@/shared/channel';
import { isSessionExpiredError } from '@/shared/isSessionExpiredError';
import { zeroizeAfterSubmission } from '@/shared/zeroize-submission';
import { cn } from '@/ui/lib/utils';
import { AnimatedCheckmark, Button } from '@/ui/ui-kit';
import { useMutation } from '@tanstack/react-query';
import EcosystemEthereumIcon from 'jsx:src/ui/assets/ecosystem-ethereum.svg';
import EcosystemSolanaIcon from 'jsx:src/ui/assets/ecosystem-solana.svg';
import React, { useEffect, useState } from 'react';
import type { IconType } from 'react-icons';
import { useNavigate } from 'react-router-dom';
import { invariant } from 'src/shared/invariant';
import { wait } from 'src/shared/wait';
import type { BlockchainType } from 'src/shared/wallet/classifiers';
import EvmChainsImg from 'url:src/ui/assets/evm-chains.png';
import { SectionHeader } from '../section-header';
import { useCreateWallet } from './create-context';

type Ecosystem = {
  id: BlockchainType;
  Icon: IconType;
  title: string;
  description: string | undefined;
};

const ecosystemsList: Ecosystem[] = [
  {
    id: 'evm',
    Icon: EcosystemEthereumIcon,
    title: 'Ethereum Ecosystem',
    description: undefined,
  },
  {
    id: 'solana',
    Icon: EcosystemSolanaIcon,
    title: 'Solana Ecosystem',
    description: 'Fast & low fees',
  },
];

import { ONBOARDING_ROUTES } from '../routes';

export function SelectEcosystem() {
  const { password, ecosystems, toggleEcosystem, setEcosystems, resetContext } =
    useCreateWallet();

  const navigate = useNavigate();

  const [_showError, setShowError] = useState(false);

  const { mutate: handleSubmit, isLoading: isGenerating } = useMutation({
    mutationFn: async () => {
      await wait(2000);
      invariant(password && password !== '', 'Password not set');
      await accountPublicRPCPort.request('createUser', { password });
      await walletPort.request('uiGenerateMnemonic', {
        ecosystems: Array.from(ecosystems),
      });
    },
    onSuccess: () => {
      zeroizeAfterSubmission();
      resetContext();
      navigate(`../${ONBOARDING_ROUTES.CREATE.BACKUP}`);
    },
    onError: (e) => {
      if (isSessionExpiredError(e)) {
        navigate(`../../${ONBOARDING_ROUTES.SESSION_EXPIRED}`, {
          replace: true,
        });
      }
      setShowError(true);
    },
  });

  const allIds = ecosystemsList.map((e) => e.id);
  const allSelected = allIds.every((id) => ecosystems.has(id));

  function toggleAll() {
    setEcosystems(allSelected ? new Set() : new Set(allIds));
  }

  function handleCreate() {
    if (ecosystems.size === 0) return;
    handleSubmit();
  }

  useEffect(() => {
    if (!password) {
      navigate(`../${ONBOARDING_ROUTES.CREATE.PASSWORD}`);
    }
  }, [password]);

  const selectedNames = ecosystemsList
    .filter((e) => ecosystems.has(e.id))
    .map((e) => e.title)
    .join(' & ');

  return (
    <>
      <SectionHeader
        title="Select your ecosystem"
        description="Choose the networks for your institutional vault. You can add more networks later in settings."
      />

      <div className="flex justify-between items-center mb-4 shrink-0">
        <span className="text-xs font-semibold text-muted-foreground/80">
          {ecosystems.size} of {ecosystemsList.length} selected
        </span>
        <button
          className="bg-transparent border-none cursor-pointer text-xs font-bold text-muted-foreground/80 p-0 transition-opacity duration-200 hover:opacity-70"
          onClick={toggleAll}
        >
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
      </div>

      <div className="flex flex-col gap-0 mb-6 shrink-0">
        {ecosystemsList.map(({ id, Icon, title, description }, index) => {
          const isSelected = ecosystems.has(id);
          return (
            <React.Fragment key={id}>
              {index > 0 && (
                <div className="flex items-center justify-center gap-4 my-2">
                  <div className="flex-1 h-px border-t border-dashed border-outline-variant/20" />
                  <span className="text-sm text-on-surface-variant font-medium">
                    And
                  </span>
                  <div className="flex-1 h-px border-t border-dashed border-outline-variant/20" />
                </div>
              )}
              <button
                disabled={isGenerating}
                className={cn(
                  'w-full text-left bg-transparent border-none p-0 cursor-pointer',
                  isGenerating ? 'pointer-events-none opacity-60' : ''
                )}
                onClick={() => toggleEcosystem(id)}
              >
                <div className="py-2 flex items-center gap-4">
                  <div className="size-10 lg:size-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200">
                    <Icon className="w-full h-full" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base md:text-lg">{title}</h3>
                    {id === 'evm' ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={EvmChainsImg}
                          alt="EVM Chains"
                          className="h-5"
                        />
                        <span className="text-[0.8125rem] text-muted-foreground/80">
                          +60 more
                        </span>
                      </div>
                    ) : description ? (
                      <p className="text-sm text-muted-foreground/80 m-0 leading-snug">
                        {description}
                      </p>
                    ) : null}
                  </div>
                  <AnimatedCheckmark
                    animate
                    checked={isSelected}
                    checkedColor="var(--muted-foreground)"
                    uncheckedColor="var(--surface-container-highest)"
                    size={20}
                  />
                </div>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      <div className="mt-auto shrink-0">
        {isGenerating ? (
          <div className="p-8 rounded-2xl bg-surface-container-low flex items-center gap-6 shrink-0">
            <div className="relative w-12 h-12 shrink-0">
              <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
              <div className="absolute inset-0 rounded-full border-4 border-primary-container border-t-transparent animate-spin" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-base text-on-surface m-0 mb-1 leading-none">
                Generating your secure wallet...
              </h4>
              <p className="text-sm text-on-surface-variant m-0">
                Deploying smart contract architecture on {selectedNames}.
              </p>
            </div>
          </div>
        ) : (
          <Button
            variant="primary"
            size="lg"
            disabled={ecosystems.size === 0}
            onClick={handleCreate}
          >
            Create Wallet
          </Button>
        )}
      </div>
    </>
  );
}
