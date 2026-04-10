import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { BlockchainType } from 'src/shared/wallet/classifiers';

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
      pathname === '/onboarding/create' ||
      pathname === '/onboarding/create/' ||
      pathname === '/onboarding/create/backup' ||
      pathname === '/onboarding/create/backup/' ||
      pathname === '/onboarding/create/processing' ||
      pathname === '/onboarding/create/processing/' ||
      pathname === '/onboarding/create/success' ||
      pathname === '/onboarding/create/success/';

    const isInputPage =
      isBasePage ||
      pathname.endsWith('/password') ||
      pathname.endsWith('/ecosystems');

    if (!isInputPage && !password) {
      navigate('/onboarding/welcome', { replace: true });
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
