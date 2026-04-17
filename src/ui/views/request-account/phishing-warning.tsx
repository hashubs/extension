import { Button } from '@/ui/ui-kit';
import { FiAlertTriangle } from 'react-icons/fi';
import { LuArrowLeft, LuShieldAlert } from 'react-icons/lu';

interface Props {
  /** The malicious origin detected. */
  url: string;
  /** Called when user clicks "Leave Site" — should close the tab. */
  onClose: () => void;
}

export function PhishingWarning({ url, onClose }: Props) {
  const hostname = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  const handleIgnore = async () => {
    // Whitelist the domain and go back to the site
    // await sendToBackground(MessageType.IGNORE_PHISHING_WARNING, { url });
    // Go back in history (this will reload the previous page)
    // window.history.back();
    // In case history.back() doesn't work (e.g. opened in new tab),
    // we could also just try to navigate there directly, but back() is safer for flow.
  };

  return (
    <div className="flex flex-col h-full bg-[#0F0F0F] text-white animate-fade-in overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-red-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-900 rounded-full blur-[100px]" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10 text-center">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-4xl flex items-center justify-center mb-8 animate-pulse shadow-[0_0_40px_rgba(239,68,68,0.1)]">
          <LuShieldAlert className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-4">
          Deceptive Site Ahead
        </h1>

        <div className="bg-red-500/5 border border-red-500/10 rounded-2xl px-4 py-3 mb-8">
          <code className="text-red-400 text-sm font-medium">{hostname}</code>
        </div>

        <p className="text-gray-400 text-base leading-relaxed mb-4">
          Selvo has blocked this site because it was identified as a known
          phishing or malicious domain.
        </p>

        <p className="text-gray-500 text-sm leading-relaxed max-w-[280px]">
          Malicious sites may try to steal your mnemonic phrase, private keys,
          or trick you into signing dangerous transactions.
        </p>
      </div>

      <div className="p-8 pt-0 flex flex-col gap-4 relative z-10">
        <Button
          onClick={onClose}
          variant="primary"
          size="lg"
          className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-500 text-white border-transparent text-base font-bold shadow-lg shadow-red-900/20 transition-all active:scale-[0.98]"
        >
          <LuArrowLeft className="w-5 h-5 mr-2" />
          Get Me Out of Here
        </Button>

        <button
          onClick={handleIgnore}
          className="w-full py-3 text-sm font-medium text-gray-500 hover:text-red-400 transition-colors flex items-center justify-center gap-2"
        >
          <FiAlertTriangle className="w-4 h-4" />I trust this site, proceed
          anyway
        </button>
      </div>
    </div>
  );
}
