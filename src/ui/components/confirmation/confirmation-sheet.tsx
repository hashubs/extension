import { cn } from '@/ui/lib/utils';
import { Button, Sheet, SheetContent } from '@/ui/ui-kit';
import { ReactNode } from 'react';
import { IconType } from 'react-icons';
import { Header } from '../header';

type ConfirmationItem = {
  icon: IconType;
  className?: string;
  text: string;
};

type ConfirmationSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;

  title?: string;

  heroIcon?: ReactNode;
  heroGradient?: string;
  heroShadow?: string;
  heading?: string;

  items?: ConfirmationItem[];

  confirmLabel?: string;
  confirmVariant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'solid'
    | 'outline'
    | 'ghost'
    | 'gradient-teal'
    | 'gradient-blue'
    | 'blank'
    | null
    | undefined;
};

const defaultProps: Partial<ConfirmationSheetProps> = {
  title: 'Confirmation',
  heroGradient: 'from-red-500 to-orange-500',
  heroShadow: 'shadow-red-500/20',
  heading: 'Before you proceed',
  items: [],
  confirmLabel: 'Confirm',
  confirmVariant: 'solid',
};

export function ConfirmationSheet({
  open,
  onOpenChange,
  onConfirm,
  title = defaultProps.title,
  heroIcon,
  heroGradient = defaultProps.heroGradient,
  heroShadow = defaultProps.heroShadow,
  heading = defaultProps.heading,
  items = defaultProps.items,
  confirmLabel = defaultProps.confirmLabel,
  confirmVariant = defaultProps.confirmVariant,
}: ConfirmationSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col h-full">
        <Header title={title} onBack={() => onOpenChange(false)} />

        <div className="flex-1 flex flex-col justify-center p-4 pt-0 space-y-4 no-scrollbar overflow-y-auto">
          <div className="flex flex-col items-center text-center mt-2 mb-8">
            {heroIcon && (
              <div
                className={`w-16 h-16 rounded-full bg-linear-to-br ${heroGradient} shadow-lg ${heroShadow} flex items-center justify-center mb-6`}
              >
                {heroIcon}
              </div>
            )}
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              {heading}
            </h1>
          </div>

          {items && items.length > 0 && (
            <div className="space-y-6 pt-4">
              {items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex gap-4 items-start">
                    <div
                      className={cn(
                        'w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5',
                        item.className
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <p className="text-sm font-medium">{item.text}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border/50">
          <Button
            variant={confirmVariant}
            size="md"
            onClick={onConfirm}
            shimmer
          >
            {confirmLabel}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
