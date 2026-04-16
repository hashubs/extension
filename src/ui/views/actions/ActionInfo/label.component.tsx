import type { AnyAddressAction } from '@/modules/ethereum/transactions/addressAction';
import { useCopyToClipboard } from '@/ui/hooks/useCopyToClipboard';
import { truncateAddress } from '@/ui/lib/utils';
import { capitalize } from 'lodash';
import { LuCheck, LuCopy } from 'react-icons/lu';

export function LabelComponent({
  label,
}: {
  label: NonNullable<AnyAddressAction['label']>;
}) {
  const address = label.wallet?.address || label.contract?.address || '';
  const name = label.wallet?.name || label.contract?.dapp?.name;

  const { isSuccess, handleCopy } = useCopyToClipboard({
    text: address,
  });

  return (
    <div className="flex items-center justify-between px-2.5 py-2.5 w-full">
      {label.displayTitle && (
        <span className="text-[14px] text-muted-foreground">
          {capitalize(label.displayTitle)}
        </span>
      )}
      <button
        onClick={() => handleCopy()}
        disabled={!address}
        className="flex items-center gap-2 text-[14px] hover:opacity-80 transition-opacity disabled:cursor-auto"
      >
        <div className="flex items-center gap-2 text-right text-foreground">
          <span className="font-bold truncate max-w-[100px]">
            {name || (address ? truncateAddress(address, 8) : '')}
          </span>
        </div>
        {address && (
          <div className={isSuccess ? 'text-[#4ade80]' : 'text-[#40a9ff]'}>
            {isSuccess ? <LuCheck size={14} /> : <LuCopy size={14} />}
          </div>
        )}
      </button>
    </div>
  );
}
