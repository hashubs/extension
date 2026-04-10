import { HiOutlineViewGrid } from 'react-icons/hi';

interface Props {
  accountName?: string;
  onMenuOpen?: () => void;
}

export function OverviewHeader({
  accountName = 'Account 1',
  onMenuOpen,
}: Props) {
  return (
    <div className="flex items-center justify-between border-b border-muted pb-2 mb-4">
      <div className="flex items-center gap-2.5 cursor-pointer">
        <div className="w-8 h-8 rounded-[6px] overflow-hidden shrink-0 bg-linear-to-br from-orange-400 to-indigo-500" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[14px] font-semibold leading-none">
            {accountName}
          </span>
          <div className="flex items-center">
            <div className="w-3.5 h-3.5 rounded-full bg-[#627eea] border-2 border-white dark:border-[#171717] z-10" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#9945ff] border-2 border-white dark:border-[#171717] -ml-1" />
          </div>
        </div>
      </div>
      <button
        onClick={onMenuOpen}
        className="text-muted-foreground/80 hover:opacity-70 transition-opacity p-1 rounded-md"
      >
        <HiOutlineViewGrid size={20} />
      </button>
    </div>
  );
}
