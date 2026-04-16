import type { AnyAddressAction } from '@/modules/ethereum/transactions/addressAction';
import { cn } from '@/ui/lib/utils';
import { useState } from 'react';
import { LuCheck, LuCopy, LuExternalLink } from 'react-icons/lu';

export function ExplorerComponent({
  transaction,
}: {
  transaction: NonNullable<AnyAddressAction['transaction']>;
}) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (!transaction.hash) return;
    navigator.clipboard.writeText(transaction.hash);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between px-2.5 py-2.5 w-full">
      <div className="flex items-center gap-2">
        <img
          src={transaction.chain.iconUrl}
          className="size-5 rounded-full"
          alt={transaction.chain.name}
        />
        <span className="text-[14px] font-bold text-foreground leading-none">
          {transaction.chain.name}
        </span>
      </div>
      <div className="flex items-center gap-4">
        {transaction.explorerUrl && (
          <a
            href={transaction.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[13px] font-bold text-[#40a9ff] hover:opacity-80 transition-opacity"
          >
            Explorer
            <LuExternalLink size={14} />
          </a>
        )}
        {transaction.hash && (
          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-1 text-[13px] font-bold transition-all hover:opacity-80',
              isCopied ? 'text-[#4ade80]' : 'text-[#40a9ff]'
            )}
          >
            Hash
            {isCopied ? <LuCheck size={14} /> : <LuCopy size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}
