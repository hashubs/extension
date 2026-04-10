import { walletPort, windowPort } from '@/shared/channel';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface MaskedWallet {
  address: string;
}

export function RequestAccountsView() {
  const [params] = useSearchParams();
  const origin = params.get('origin');
  const requestId = params.get('windowId'); // Zerion uses 'windowId' parameter name in URL for requestId
  const ecosystem = params.get('ecosystem') as 'evm' | 'solana' | null;
  const [currentWallet, setCurrentWallet] = useState<MaskedWallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCurrentWallet() {
      try {
        const wallet = await walletPort.request('uiGetCurrentWallet');
        setCurrentWallet(wallet as MaskedWallet);
      } catch (err) {
        console.error('Failed to fetch current wallet:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCurrentWallet();
  }, []);

  const handleConnect = async () => {
    if (!requestId || !currentWallet || !origin) return;
    try {
      await windowPort.confirm(requestId, {
        address: currentWallet.address,
        origin,
      });
    } catch (err) {
      console.error('Failed to confirm connection:', err);
    }
  };

  const handleCancel = async () => {
    if (!requestId) return;
    try {
      await windowPort.reject(requestId);
    } catch (err) {
      console.error('Failed to reject connection:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-gray-500 animate-pulse">
        Loading request...
      </div>
    );
  }

  return (
    <div className="connection-request-view flex flex-col min-h-[400px] bg-white animate-fade-in">
      <header className="p-4 border-b bg-gray-50/50 flex flex-col items-center space-y-1 sticky top-0 backdrop-blur-sm z-10">
        <h1 className="text-sm font-bold text-gray-900">Connection Request</h1>
        <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">
            Handshake in progress
          </span>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center border-2 border-gray-100 shadow-inner group">
            <span className="text-4xl group-hover:scale-110 transition-transform duration-500">
              🌐
            </span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center text-white text-xs font-bold shadow-lg">
            !
          </div>
        </div>

        <div className="text-center space-y-3">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-none">
              Connecting to
            </p>
            <p className="text-lg font-black text-gray-900 break-all px-4">
              {origin}
            </p>
          </div>
          <p className="text-xs text-gray-500 px-6 leading-relaxed">
            This site wants to view your public address and request transaction
            signatures.
          </p>
        </div>

        {currentWallet ? (
          <div className="w-full p-5 bg-gray-900 rounded-[28px] shadow-xl shadow-gray-200 space-y-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                {ecosystem === 'solana' ? 'Solana Wallet' : 'Ethereum Wallet'}
              </span>
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-gray-400 break-all leading-relaxed p-3 bg-white/5 rounded-xl border border-white/10">
                {currentWallet.address}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-xs font-bold">
            No active wallet found. Please create or unlock your wallet.
          </div>
        )}
      </main>

      <footer className="p-4 border-t bg-gray-50/50 backdrop-blur-sm flex gap-3 sticky bottom-0">
        <button
          onClick={handleCancel}
          className="flex-1 py-4 px-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-[0.98] shadow-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleConnect}
          disabled={!currentWallet}
          className="flex-2 py-4 px-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:active:scale-100"
        >
          Connect
        </button>
      </footer>
    </div>
  );
}
