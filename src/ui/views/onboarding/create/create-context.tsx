import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { BlockchainType } from 'src/shared/wallet/classifiers';
import { ONBOARDING_ROUTES } from '../routes';

interface CreateWalletContextType {
  password: string | null;
  setPassword: (password: string) => void;
  ecosystems: Set<BlockchainType>;
  setEcosystems: (ecosystems: Set<BlockchainType>) => void;
  toggleEcosystem: (id: BlockchainType) => void;
  resetContext: () => void;
}

const CreateWalletContext = createContext<CreateWalletContextType | undefined>(
  undefined
);

const INITIAL_ECOSYSTEMS: Set<BlockchainType> = new Set(['evm', 'solana']);

export function CreateWalletProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [password, setPassword] = useState<string | null>(null);
  const [ecosystems, setEcosystems] =
    useState<Set<BlockchainType>>(INITIAL_ECOSYSTEMS);

  const toggleEcosystem = (id: BlockchainType) => {
    setEcosystems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const resetContext = () => {
    setPassword(null);
    setEcosystems(INITIAL_ECOSYSTEMS);
  };

  useEffect(() => {
    const isBasePage =
      pathname.endsWith(`/${ONBOARDING_ROUTES.CREATE.ROOT}`) ||
      pathname.endsWith(`/${ONBOARDING_ROUTES.CREATE.ROOT}/`) ||
      pathname.endsWith(`/${ONBOARDING_ROUTES.CREATE.BACKUP}`) ||
      pathname.endsWith(`/${ONBOARDING_ROUTES.CREATE.BACKUP}/`) ||
      pathname.endsWith(`/${ONBOARDING_ROUTES.CREATE.PROCESSING}`) ||
      pathname.endsWith(`/${ONBOARDING_ROUTES.CREATE.PROCESSING}/`) ||
      pathname.endsWith(`/${ONBOARDING_ROUTES.CREATE.SUCCESS}`) ||
      pathname.endsWith(`/${ONBOARDING_ROUTES.CREATE.SUCCESS}/`);

    const isInputPage =
      isBasePage ||
      pathname.endsWith(`/${ONBOARDING_ROUTES.CREATE.PASSWORD}`) ||
      pathname.endsWith(`/${ONBOARDING_ROUTES.CREATE.ECOSYSTEM}`);

    if (!isInputPage && !password) {
      navigate(`../${ONBOARDING_ROUTES.WELCOME}`, { replace: true });
    }
  }, [password, pathname, navigate]);

  return (
    <CreateWalletContext.Provider
      value={{
        password,
        setPassword,
        ecosystems,
        setEcosystems,
        toggleEcosystem,
        resetContext,
      }}
    >
      {children}
    </CreateWalletContext.Provider>
  );
}

export function useCreateWallet() {
  const context = useContext(CreateWalletContext);
  if (context === undefined) {
    throw new Error(
      'useCreateWallet must be used within a CreateWalletProvider'
    );
  }
  return context;
}
