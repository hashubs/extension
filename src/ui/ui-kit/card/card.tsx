import { cn } from '@/ui/lib/utils';
import { forwardRef } from 'react';
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
} & TitleIconProps &
  React.ComponentPropsWithoutRef<'div'>;

type ResolvedTitleIconProps = {
  titleIcon?: IconType;
  titleIconNode?: React.ReactNode;
  titleIconUrl?: string;
  titleIconAlt?: string;
  titleIconClassName?: string;
};

function TitleIcon({ props }: { props: ResolvedTitleIconProps }) {
  const className = cn(
    'w-4 h-4 shrink-0 flex items-center justify-center',
    props.titleIconClassName
  );

  if (props.titleIconUrl) {
    return (
      <img
        src={props.titleIconUrl}
        alt={props.titleIconAlt}
        className={cn(
          'w-4 h-4 rounded-sm object-cover shrink-0',
          props.titleIconClassName
        )}
      />
    );
  }

  if (props.titleIconNode) {
    return <span className={className}>{props.titleIconNode}</span>;
  }

  if (props.titleIcon) {
    const Icon = props.titleIcon;
    return (
      <Icon size={14} className={cn('shrink-0', props.titleIconClassName)} />
    );
  }

  return null;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, classNameTitle, title, ...props }, ref) => {
    const {
      titleIcon,
      titleIconNode,
      titleIconUrl,
      titleIconAlt,
      titleIconClassName,
      ...domProps
    } = props as ResolvedTitleIconProps & React.ComponentPropsWithoutRef<'div'>;

    const hasTitleIcon = titleIcon || titleIconNode || titleIconUrl;

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
                props={{
                  titleIcon,
                  titleIconNode,
                  titleIconUrl,
                  titleIconAlt,
                  titleIconClassName,
                }}
              />
            )}
            <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              {title}
            </h2>
          </div>
        )}
        <div
          ref={ref}
          className={cn(
            'bg-item overflow-hidden border border-border/20 rounded-xl divide-y divide-border/20',
            className
          )}
          {...domProps}
        >
          {children}
        </div>
      </>
    );
  }
);

Card.displayName = 'Card';
