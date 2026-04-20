import { Button } from '@/ui/ui-kit';
import { LuFileWarning } from 'react-icons/lu';

interface Props {
  title?: string;
  description?: string;
  onBack?: () => void;
  backText?: string;
}

export function ViewNotFound({
  title = 'Page Not Found',
  description = "The page you're looking for doesn't exist or has been moved.",
  onBack,
  backText = 'Go Back',
}: Props) {
  return (
    <div className="flex flex-col h-full w-full items-center justify-center text-center gap-2 px-4">
      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
        <LuFileWarning className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-bold tracking-tight mb-2 text-foreground">
        {title}
      </h2>
      <p className="text-sm text-muted-foreground mb-8 max-w-[250px]">
        {description}
      </p>

      {onBack && (
        <Button variant="secondary" size="md" onClick={onBack}>
          {backText}
        </Button>
      )}
    </div>
  );
}
