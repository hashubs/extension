import { cn } from '@/ui/lib/utils';

export function Footer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2.5 mt-auto pt-8', className)}>
      {children}
    </div>
  );
}
