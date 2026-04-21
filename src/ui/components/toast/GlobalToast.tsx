import { useToastStore } from '@/shared/store/useToastStore';
import { cn } from '@/ui/lib/utils';
import { cva } from 'class-variance-authority';
import { LuX } from 'react-icons/lu';

const toastVariants = cva(
  'fixed z-[100] text-sm py-2 px-4 rounded-full shadow-lg animate-slide-up flex items-center gap-2 bottom-5 left-1/2 -translate-x-1/2 transition-all duration-300',
  {
    variants: {
      visible: {
        true: 'opacity-100 translate-y-0 pointer-events-auto',
        false: 'opacity-0 translate-y-2 pointer-events-none',
      },
      variant: {
        default: 'bg-black text-white dark:bg-white dark:text-black',
        success: 'bg-green-600 text-white',
        error: 'bg-red-600 text-white',
      },
    },
    defaultVariants: {
      visible: false,
      variant: 'default',
    },
  }
);

export function GlobalToast() {
  const { message, visible, showClose, variant, hide } = useToastStore();

  if (!message && !visible) return null;

  return (
    <div className={cn(toastVariants({ visible, variant }))}>
      <span className="text-nowrap">{message}</span>
      {showClose && (
        <button
          onClick={hide}
          type="button"
          className="ml-1 rounded-full p-0.5 hover:bg-muted/10 transition-colors"
        >
          <LuX className="size-3.5" />
        </button>
      )}
    </div>
  );
}
