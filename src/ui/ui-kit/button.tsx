import { cn } from '@/ui/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ButtonHTMLAttributes, forwardRef } from 'react';
import type { IconType } from 'react-icons';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const buttonVariants = cva(
  'group relative w-full overflow-hidden rounded-xl disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'bg-accent/50 hover:enabled:bg-accent/80',
        primary:
          'bg-primary text-primary-foreground hover:enabled:bg-primary/80',
        secondary:
          'bg-secondary text-secondary-foreground hover:enabled:bg-secondary/80',
        danger: 'bg-red-500/50 hover:enabled:bg-red-500/80',
        solid: 'bg-foreground text-background hover:enabled:bg-foreground/90',
        outline: 'border border-accent',
        ghost: 'bg-transparent hover:enabled:bg-accent/80',
        'gradient-teal':
          'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg shadow-teal-500/25 hover:enabled:bg-teal-600/80',
        'gradient-blue':
          'bg-gradient-to-r from-blue-600 to-cyan-700 text-white shadow-lg shadow-blue-500/25 hover:enabled:bg-blue-600/80',

        blank: '',
      },
      size: {
        sm: 'h-8 px-4 text-xs',
        md: 'h-9 md:h-10 px-6 text-sm',
        lg: 'h-10 md:h-12 px-8 text-sm md:text-base',
        xl: 'h-12 md:h-14 px-10 text-base md:text-lg',
        icon: 'h-8 w-8',
        zero: '',
      },
      transition: {
        none: '',
        slow: 'transition-all duration-700 hover:enabled:scale-[1.02]',
        fast: 'transition-all duration-300 hover:enabled:scale-[1.02]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      transition: 'slow',
    },
  }
);

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>,
    VariantProps<typeof buttonVariants> {
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
      iconPosition = 'right',
      shimmer = false,
      shimmerClassName,
      iconClassName,
      loading = false,
      loadingText = 'Loading...',
      disabled = false,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, transition }), className)}
        disabled={isDisabled}
        {...props}
      >
        {shimmer && !loading && (
          <div
            className={cn(
              'absolute inset-0 bg-linear-to-r from-background/0 via-white/10 to-background/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700',
              shimmerClassName
            )}
          />
        )}
        <span className="relative font-medium flex items-center justify-center gap-2">
          {loading ? (
            <>
              <AiOutlineLoading3Quarters className="animate-spin h-4 w-4" />
              {loadingText}
            </>
          ) : (
            <>
              {Icon && iconPosition === 'left' && (
                <Icon className={cn('w-4 h-4', iconClassName)} />
              )}
              {children}
              {Icon && iconPosition === 'right' && (
                <Icon className={cn('w-4 h-4', iconClassName)} />
              )}
            </>
          )}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';
