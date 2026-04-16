import { Popover, PopoverContent, PopoverTrigger } from '@/ui/ui-kit/popover';
import { IoChevronDown } from 'react-icons/io5';
import {
  LuArrowDownAZ,
  LuArrowDownWideNarrow,
  LuArrowUpWideNarrow,
} from 'react-icons/lu';

export type SortOption = 'alphabetical' | 'declining-balance' | 'native-top';

const sortOptions: {
  value: SortOption;
  icon: any;
  label: string;
}[] = [
  {
    value: 'native-top',
    icon: LuArrowUpWideNarrow,
    label: 'Native tokens on top',
  },
  { value: 'alphabetical', icon: LuArrowDownAZ, label: 'Alphabetically (A-Z)' },
  {
    value: 'declining-balance',
    icon: LuArrowDownWideNarrow,
    label: 'Declining balance ($ high-low)',
  },
];

interface SortSelectorComponentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortSelectorComponent({
  open,
  onOpenChange,
  value,
  onChange,
}: SortSelectorComponentProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={
          <button
            className="flex items-center gap-1.75"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="font-medium">Sort by</span>
            <IoChevronDown size={15} />
          </button>
        }
      />

      <PopoverContent className="w-full p-1 gap-0.5" align="end">
        {sortOptions.map(({ value: optValue, icon: Icon, label }) => (
          <button
            key={optValue}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onChange(optValue);
              const el = document.getElementById('x2-pophidden');
              if (el) el.style.removeProperty('overflow');
              onOpenChange(false);
            }}
            className={`
              w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-md text-xs font-medium
              transition-all duration-200
              ${
                value === optValue
                  ? 'bg-indigo-500/20 text-indigo-300'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }
            `}
          >
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Icon size={14} />
              <span>{label}</span>
            </div>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
