import { cn } from '../lib/utils';

export function NeutralDecimals({
  parts,
  neutralColor = 'text-muted-foreground/80',
  className,
}: {
  parts: Intl.NumberFormatPart[];
  neutralColor?: string;
  className?: string;
}) {
  return (
    <>
      {parts.map((part, index) => (
        <span
          key={index}
          className={cn(
            part.type === 'decimal' || part.type === 'fraction'
              ? neutralColor
              : undefined,
            className
          )}
        >
          {part.value}
        </span>
      ))}
    </>
  );
}
