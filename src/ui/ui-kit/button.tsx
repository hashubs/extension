import { cn } from '@/ui/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ButtonHTMLAttributes, forwardRef } from 'react';
import type { IconType } from 'react-icons';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useAnimationPreference } from '../features/appearance';

const buttonVariants = cva(
  [
    'group relative overflow-hidden rounded-lg w-full',
    'inline-flex items-center justify-center',
    'font-base select-none outline-none',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-accent/50 hover:enabled:bg-accent/80',
        primary:
          'bg-primary text-primary-foreground hover:enabled:bg-primary/80',
        secondary:
          'bg-secondary text-secondary-foreground hover:enabled:bg-secondary/80',
        danger: 'bg-destructive/50 hover:enabled:bg-destructive/80',
        solid: 'bg-foreground text-background hover:enabled:bg-foreground/90',
        outline: 'border border-muted-foreground/10',
        ghost: 'bg-transparent hover:enabled:bg-accent/80',
        'gradient-teal':
          'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg shadow-teal-500/25 hover:enabled:brightness-110',
        'gradient-blue':
          'bg-gradient-to-r from-blue-600 to-cyan-700 text-white shadow-lg shadow-blue-500/25 hover:enabled:brightness-110',
        blank: '',
      },
      size: {
        sm: 'h-8 px-3 text-xs gap-1.5',
        md: 'h-9 md:h-10 px-5 text-sm gap-2',
        lg: 'h-10 md:h-12 px-7 text-sm md:text-base gap-2',
        xl: 'h-12 md:h-14 px-9 text-base md:text-lg gap-2.5',
        zero: '',
      },
      iconSize: {
        sm: 'h-7 w-7',
        md: 'h-8 w-8',
        lg: 'h-9 w-9',
        xl: 'h-10 w-10',
      },
      transition: {
        none: '',
        slow: 'transition-all duration-700 hover:enabled:scale-[1.02]',
        fast: 'transition-all duration-300 hover:enabled:scale-[1.02]',
      },
    },
    defaultVariants: {
      variant: 'default',
      transition: 'slow',
    },
  }
);

const iconSizeMap: Record<string, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-4 w-4',
  xl: 'h-5 w-5',
};

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>,
    Omit<VariantProps<typeof buttonVariants>, 'iconSize'> {
  iconOnly?: boolean;
  iconOnlySize?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: IconType;
  iconPosition?: 'left' | 'right';
  shimmer?: boolean;
  shimmerClassName?: string;
  iconClassName?: string;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      transition,
      children,
      icon: Icon,
      iconOnly = false,
      iconOnlySize = 'md',
      iconPosition = 'right',
      shimmer = false,
      shimmerClassName,
      iconClassName,
      loading = false,
      loadingText,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const { enableAnimation } = useAnimationPreference();

    const isDisabled = disabled || loading;

    const resolvedTransition = enableAnimation ? transition : 'none';

    if (iconOnly) {
      return (
        <button
          ref={ref}
          className={cn(
            buttonVariants({
              variant,
              size: undefined,
              iconSize: iconOnlySize,
              transition: 'none',
            }),
            'rounded-lg p-0',
            className
          )}
          disabled={isDisabled}
          aria-label={props['aria-label'] ?? 'button'}
          {...props}
        >
          {shimmer && !loading && (
            <ShimmerOverlay
              className={shimmerClassName}
              enableAnimation={enableAnimation}
            />
          )}
          {loading ? (
            <AiOutlineLoading3Quarters className="animate-spin h-4 w-4" />
          ) : Icon ? (
            <Icon
              className={cn(
                iconSizeMap[iconOnlySize] ?? 'h-4 w-4',
                iconClassName
              )}
            />
          ) : null}
        </button>
      );
    }

    const resolvedSize = size ?? 'md';
    const sizeKey = resolvedSize as string;
    const resolvedIconClass = cn(
      iconSizeMap[sizeKey] ?? 'h-4 w-4',
      iconClassName
    );

    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({
            variant,
            size: resolvedSize,
            transition: resolvedTransition,
          }),
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {shimmer && !loading && (
          <ShimmerOverlay
            className={shimmerClassName}
            enableAnimation={enableAnimation}
          />
        )}

        {loading ? (
          <>
            <AiOutlineLoading3Quarters
              className={cn(
                'h-4 w-4 shrink-0',
                enableAnimation && 'animate-spin'
              )}
            />
            {loadingText ?? children}
          </>
        ) : (
          <>
            {Icon && iconPosition === 'left' && (
              <Icon className={resolvedIconClass} />
            )}
            {children}
            {Icon && iconPosition === 'right' && (
              <Icon className={resolvedIconClass} />
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

function ShimmerOverlay({
  className,
  enableAnimation,
}: {
  className?: string;
  enableAnimation: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0',
        'bg-linear-to-r from-background/0 via-white/10 to-background/0',
        enableAnimation
          ? '-translate-x-full group-hover:translate-x-full transition-transform duration-700'
          : 'hidden',
        className
      )}
    />
  );
}
