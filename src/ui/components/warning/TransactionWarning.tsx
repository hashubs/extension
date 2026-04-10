import { cn } from '@/ui/lib/utils';
import {
  alertVariants,
  descriptionVariants,
  titleVariants,
} from '@/ui/ui-kit/alert';
import React from 'react';

type Kind = 'danger' | 'warning' | 'info';

export function TransactionWarning({
  title,
  message,
  footer,
  kind = 'warning',
  className,
}: {
  title?: string;
  message: React.ReactNode;
  footer?: React.ReactNode;
  kind?: Kind;
  className?: string;
}) {
  const variant = kind;

  return (
    <div
      className={cn(
        alertVariants({ variant }),
        'flex flex-col gap-2 px-4 py-3 rounded-xl border',
        className
      )}
    >
      {title ? (
        <div
          className={cn(titleVariants({ variant }), 'text-sm font-semibold')}
        >
          {title}
        </div>
      ) : null}
      {message ? (
        <div
          className={cn(
            descriptionVariants({ variant }),
            'text-xs font-normal w-full'
          )}
        >
          {message}
        </div>
      ) : null}
      {footer}
    </div>
  );
}
