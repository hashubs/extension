import { cn } from '@/ui/lib/utils';
import type { IconType } from 'react-icons';

type TitleIconProps =
  | {
      titleIcon: IconType;
      titleIconNode?: never;
      titleIconUrl?: never;
      titleIconClassName?: string;
    }
  | {
      titleIconNode: React.ReactNode;
      titleIcon?: never;
      titleIconUrl?: never;
      titleIconClassName?: string;
    }
  | {
      titleIconUrl: string;
      titleIconAlt?: string;
      titleIcon?: never;
      titleIconNode?: never;
      titleIconClassName?: string;
    }
  | {
      titleIcon?: never;
      titleIconNode?: never;
      titleIconUrl?: never;
      titleIconClassName?: never;
    };

type CardProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
  classNameTitle?: string;
} & TitleIconProps;

function TitleIcon({ props }: { props: CardProps }) {
  const className = cn(
    'w-4 h-4 shrink-0 flex items-center justify-center',
    props.titleIconClassName
  );

  if ('titleIconUrl' in props && props.titleIconUrl) {
    return (
      <img
        src={props.titleIconUrl}
        alt={'titleIconAlt' in props ? props.titleIconAlt : undefined}
        className={cn(
          'w-4 h-4 rounded-sm object-cover shrink-0',
          props.titleIconClassName
        )}
      />
    );
  }

  if ('titleIconNode' in props && props.titleIconNode) {
    return <span className={className}>{props.titleIconNode}</span>;
  }

  if ('titleIcon' in props && props.titleIcon) {
    const Icon = props.titleIcon;
    return (
      <Icon size={14} className={cn('shrink-0', props.titleIconClassName)} />
    );
  }

  return null;
}

export function Card({
  children,
  className,
  classNameTitle,
  title,
  ...props
}: CardProps) {
  const hasTitleIcon =
    ('titleIcon' in props && props.titleIcon) ||
    ('titleIconNode' in props && props.titleIconNode) ||
    ('titleIconUrl' in props && props.titleIconUrl);

  return (
    <>
      {title && (
        <div
          className={cn(
            'flex items-center gap-1.5 mb-1.5 ml-1',
            classNameTitle
          )}
        >
          {hasTitleIcon && (
            <TitleIcon
              props={
                {
                  children,
                  className,
                  title,

                  ...props,
                } as CardProps
              }
            />
          )}
          <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            {title}
          </h2>
        </div>
      )}
      <div
        className={cn(
          'bg-item overflow-hidden border border-border/20 rounded-xl divide-y divide-border/20',
          className
        )}
      >
        {children}
      </div>
    </>
  );
}
