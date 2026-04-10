import type { IconType } from 'react-icons';
import {
  MdAccountBalanceWallet,
  MdAddCircle,
  MdChevronRight,
  MdFileDownload,
  MdVerifiedUser,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '../section-header';

import { ONBOARDING_ROUTES } from '../routes';

type WalletOption = {
  id: string;
  Icon: IconType;
  title: string;
  description: string;
  to: string;
};

const walletOptions: WalletOption[] = [
  {
    id: 'create',
    Icon: MdAddCircle,
    title: 'Create New Wallet',
    description: 'Generate a fresh secure vault and starting keys.',
    to: ONBOARDING_ROUTES.CREATE.ROOT,
  },
  {
    id: 'import',
    Icon: MdFileDownload,
    title: 'Import Existing Wallet',
    description: 'Recover your assets using a 12 or 24-word seed phrase.',
    to: ONBOARDING_ROUTES.IMPORT.ROOT,
  },
  {
    id: 'ledger',
    Icon: MdAccountBalanceWallet,
    title: 'Connect Ledger',
    description: 'Use your hardware device for maximum cold-storage security.',
    to: 'hardware',
  },
];

export function Welcome() {
  const navigate = useNavigate();

  return (
    <>
      <SectionHeader
        title="Welcome to Your Wallet"
        description="Select how you would like to begin your journey into the Monolith ecosystem."
      />

      <div className="flex flex-col gap-4 grow">
        {walletOptions.map(({ id, Icon, title, description, to }) => (
          <div
            key={id}
            onClick={() => navigate(`../${to}`)}
            className="group cursor-pointer p-5 rounded-xl bg-surface-container-lowest border border-transparent transition-[border-color,background-color] duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex items-start gap-5 hover:border-primary-fixed-dim hover:bg-surface-bright"
          >
            <div className="w-8 h-8 rounded-lg bg-surface-container-low text-primary-container flex items-center justify-center shrink-0 transition-[background-color,color] duration-200 group-hover:bg-primary-container group-hover:text-on-primary">
              <Icon size={22} />
            </div>
            <div className="grow">
              <h3 className="font-bold text-lg text-on-surface mt-0 mb-1">
                {title}
              </h3>
              <p className="text-sm text-on-surface-variant leading-6 m-0">
                {description}
              </p>
            </div>
            <MdChevronRight
              size={24}
              className="self-center shrink-0 transition-colors duration-200 text-on-surface-variant group-hover:text-primary-container"
            />
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-muted-foreground/10 inline-flex justify-between items-center shrink-0">
        <p className="text-xs flex items-center gap-1.5 m-0 text-muted-foreground/80">
          <MdVerifiedUser size={14} />
          Secured by Monolith Protocol
        </p>
        <a
          className="text-[0.8125rem] font-semibold text-muted-foreground/80"
          href="#"
        >
          Privacy
        </a>
      </div>
    </>
  );
}
