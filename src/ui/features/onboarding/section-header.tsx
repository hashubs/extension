import { cn } from '@/ui/lib/utils';

interface Props {
  title: string;
  description: string;
  classNameTitle?: string;
  classNameDescription?: string;
}

export function SectionHeader({
  title,
  description,
  classNameTitle,
  classNameDescription,
}: Props) {
  return (
    <div className="mb-10">
      <h1
        className={cn(
          'text-2xl md:text-4xl font-extrabold mb-3 tracking-tight leading-tight',
          classNameTitle
        )}
      >
        {title}
      </h1>
      <p
        className={cn(
          'text-foreground/80 max-w-md leading-relaxed',
          classNameDescription
        )}
      >
        {description}
      </p>
    </div>
  );
}
