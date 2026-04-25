import { accountPublicRPCPort, walletPort } from '@/shared/channels';
import { isSolanaPath } from '@/shared/wallet/derivation-paths';
import {
  preferenceStore,
  ThemePreference,
} from '@/ui/features/appearance/preference-store';
import { useStore } from '@store-unit/react';
import React, { useEffect, useState } from 'react';

interface MaskedWallet {
  address: string;
  mnemonic?: {
    path: string;
  };
}

interface WalletGroup {
  id: string;
  name: string;
  walletContainer: {
    wallets: MaskedWallet[];
  };
}

export const DashboardView: React.FC<{ onLogout: () => void }> = ({
  onLogout,
}) => {
  const [groups, setGroups] = useState<WalletGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const preferences = useStore(preferenceStore);
  const isDark = preferences.mode === ThemePreference.dark;

  const toggleTheme = () => {
    preferenceStore.setState({
      ...preferenceStore.getState(),
      mode: isDark ? ThemePreference.light : ThemePreference.dark,
    });
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await walletPort.request('uiGetWalletGroups');
        if (data) {
          setGroups(data as WalletGroup[]);
        }
      } catch (err) {
        console.error('Failed to fetch wallet groups:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const handleLogout = async () => {
    await accountPublicRPCPort.request('logout');
    onLogout();
  };

  if (loading)
    return (
      <div className="p-8 text-center text-sm text-gray-500 animate-pulse">
        Loading wallet...
      </div>
    );

  const allWallets = groups.flatMap((group) =>
    group.walletContainer.wallets.map((wallet) => ({
      ...wallet,
      groupName: group.name,
    }))
  );

  return (
    <div className="dashboard-container min-h-[400px] flex flex-col bg-white dark:bg-gray-900 transition-colors">
      <header className="p-4 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 transition-colors">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400">
            Youno Wallet
          </h1>
          <span className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded font-bold uppercase transition-colors">
            Mainnet
          </span>
        </div>
        <button
          onClick={toggleTheme}
          className="text-xs p-2 rounded bg-gray-200 dark:bg-gray-700 dark:text-white transition-colors"
        >
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      <main className="p-4 flex-1 space-y-4 overflow-y-auto">
        {allWallets.length === 0 ? (
          <div className="text-center text-gray-400 mt-10 py-10 border-2 border-dashed border-gray-100 rounded-2xl">
            <p className="text-sm">No accounts found.</p>
          </div>
        ) : (
          allWallets.map((wallet, i) => (
            <div
              key={i}
              className="account-card p-4 border dark:border-gray-700 rounded-xl shadow-sm hover:border-blue-300 dark:hover:border-blue-500 transition-all hover:translate-y-[-2px] bg-white dark:bg-gray-800 group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                  {wallet.mnemonic?.path && isSolanaPath(wallet.mnemonic.path)
                    ? 'Solana'
                    : 'Ethereum'}
                </span>
                <span className="text-[10px] text-gray-300 dark:text-gray-600 font-mono italic">
                  {wallet.groupName}
                </span>
              </div>
              <div className="text-xs break-all font-mono text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-2 rounded-lg border border-gray-100 dark:border-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:border-blue-100 transition-colors">
                {wallet.address}
              </div>
            </div>
          ))
        )}
      </main>

      <footer className="p-4 border-t dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm sticky bottom-0 transition-colors">
        <button
          onClick={handleLogout}
          className="w-full py-3 px-4 bg-gray-900 dark:bg-gray-700 text-white rounded-xl font-semibold hover:bg-black dark:hover:bg-gray-600 transition-all shadow-md active:transform active:scale-95 flex items-center justify-center gap-2"
        >
          Logout
        </button>
      </footer>
    </div>
  );
};
