import { cn } from '../lib/utils';

interface BadgeProps {
  text: string;
  className?: string;
}

export const TextBadge = ({ text, className }: BadgeProps) => (
  <span className={cn('text-xs font-medium text-foreground/60', className)}>
    {text}
  </span>
);
