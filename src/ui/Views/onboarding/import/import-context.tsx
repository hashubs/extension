import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface ImportWalletContextType {
  phrase: string;
  setPhrase: (phrase: string) => void;
  privateKey: string;
  setPrivateKey: (key: string) => void;
  password: string | null;
  setPassword: (password: string) => void;
  method: 'phrase' | 'privateKey';
  setMethod: (method: 'phrase' | 'privateKey') => void;
  selectedAddresses: Set<string>;
  setSelectedAddresses: (addresses: Set<string>) => void;
  toggleAddress: (address: string) => void;
  resetContext: () => void;
}

const ImportWalletContext = createContext<ImportWalletContextType | undefined>(
  undefined
);

export function ImportWalletProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [phrase, setPhrase] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [password, setPassword] = useState<string | null>(null);
  const [method, setMethod] = useState<'phrase' | 'privateKey'>('phrase');
  const [selectedAddresses, setSelectedAddresses] = useState<Set<string>>(
    new Set()
  );

  const toggleAddress = (address: string) => {
    setSelectedAddresses((prev) => {
      const next = new Set(prev);
      if (next.has(address)) {
        next.delete(address);
      } else {
        next.add(address);
      }
      return next;
    });
  };

  const resetContext = () => {
    setPhrase('');
    setPrivateKey('');
    setPassword(null);
    setMethod('phrase');
    setSelectedAddresses(new Set());
  };

  useEffect(() => {
    const isBasePage =
      pathname === '/onboarding/import' ||
      pathname === '/onboarding/import/' ||
      pathname === '/onboarding/import/success' ||
      pathname === '/onboarding/import/success/';

    const isInputPage =
      isBasePage ||
      pathname.endsWith('/phrase') ||
      pathname.endsWith('/private-key');

    if (!isInputPage && !phrase && !privateKey) {
      navigate('/onboarding/welcome', { replace: true });
    }
  }, [phrase, privateKey, pathname, navigate]);

  return (
    <ImportWalletContext.Provider
      value={{
        phrase,
        setPhrase,
        privateKey,
        setPrivateKey,
        password,
        setPassword,
        method,
        setMethod,
        selectedAddresses,
        setSelectedAddresses,
        toggleAddress,
        resetContext,
      }}
    >
      {children}
    </ImportWalletContext.Provider>
  );
}

export function useImportWallet() {
  const context = useContext(ImportWalletContext);
  if (context === undefined) {
    throw new Error(
      'useImportWallet must be used within an ImportWalletProvider'
    );
  }
  return context;
}
