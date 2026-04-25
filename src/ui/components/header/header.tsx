import { cn } from '@/ui/lib/utils';
import { LuChevronLeft } from 'react-icons/lu';

interface Props {
  title?: string;
  onBack?: () => void;
  renderElement?: React.ReactNode;
  className?: string;
}

export function Header({ title, onBack, renderElement, className }: Props) {
  return (
    <div
      className={cn(
        'flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md py-4 mb-0! shrink-0 z-20 gap-2',
        className
      )}
    >
      {onBack && (
        <button
          type="button"
          className="size-[32px] rounded-[9px] flex items-center justify-center bg-muted hover:bg-muted/80"
          onClick={onBack}
          aria-label="Back"
        >
          <LuChevronLeft size={20} />
        </button>
      )}
      {title && (
        <h1 className="text-base font-medium tracking-wide">{title}</h1>
      )}
      {renderElement}
    </div>
  );
}
