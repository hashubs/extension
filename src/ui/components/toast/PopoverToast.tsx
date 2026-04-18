import { cn } from '@/ui/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import React, { useImperativeHandle, useRef, useState } from 'react';
import { Content } from 'react-area';
import { LuX } from 'react-icons/lu';

export interface PopoverToastHandle {
  removeToast: () => void;
  hideToast: () => void;
  showToast: () => void;
}

const popoverToastVariants = cva(
  'fixed z-50 bg-black text-white dark:bg-white dark:text-black text-sm py-2 px-4 rounded-full shadow-lg animate-slide-up flex items-center gap-2',
  {
    variants: {
      position: {
        'bottom-center': 'bottom-5 left-1/2 -translate-x-1/2',
        'bottom-left': 'bottom-5 left-5',
        'bottom-right': 'bottom-5 right-5',
        'top-center': 'top-5 left-1/2 -translate-x-1/2',
        'top-left': 'top-5 left-5',
        'top-right': 'top-5 right-5',
      },
    },
    defaultVariants: {
      position: 'bottom-center',
    },
  }
);

interface PopoverToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof popoverToastVariants> {
  showClose?: boolean;
}

function PopoverToastComponent(
  {
    position,
    className,
    showClose = true,
    children,
    ...props
  }: PopoverToastProps,
  ref: React.Ref<PopoverToastHandle>
) {
  const [visible, setVisible] = useState(false);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  const removeToast = () => {
    clearTimeout(timerIdRef.current ?? 0);
    setVisible(false);
  };
  const hideToast = () => {
    setVisible(false);
  };
  const showToast = () => {
    setVisible(true);
    timerIdRef.current = setTimeout(hideToast, 3000);
  };

  useImperativeHandle(ref, () => ({ removeToast, hideToast, showToast }));

  if (!visible) return null;

  return (
    <Content name="toast-overlay">
      <div
        className={cn(popoverToastVariants({ position }), className)}
        {...props}
      >
        <span className="text-nowrap">{children}</span>
        {showClose && (
          <button
            onClick={removeToast}
            type="button"
            className="ml-1 rounded-full p-0.5 hover:bg-muted/10 transition-colors"
          >
            <LuX className="size-3.5" />
          </button>
        )}
      </div>
    </Content>
  );
}

export const PopoverToast = React.forwardRef(PopoverToastComponent);
