import { cn } from '@/ui/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

const inputVariants = cva(
  'file:text-foreground placeholder:text-muted-foreground/50 placeholder:text-xs selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus:ring-1.75',
  {
    variants: {
      size: {
        sm: 'h-8 px-2.5 py-1 text-xs',
        md: 'h-9 md:h-10 px-3 py-2 text-sm',
        lg: 'h-10 md:h-12 px-4 md:py-3 text-sm md:text-base',
        xl: 'h-12 md:h-14 px-5 md:py-4 text-base md:text-lg',
        blank: '',
      },
      status: {
        default: 'border-input focus:border-ring focus:ring-ring/50',
        error:
          'border-destructive focus:border-destructive focus:ring-destructive/5',
        success: 'border-teal-500 focus:border-teal-500 focus:ring-teal-500/5',
      },
    },
    defaultVariants: {
      size: 'md',
      status: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  isError?: boolean;
  isValid?: boolean;
  icon?: React.ElementType;
  iconPosition?: 'left' | 'right';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      size,
      isError,
      isValid,
      icon: Icon,
      iconPosition = 'left',
      ...props
    },
    ref
  ) => {
    const status = isError ? 'error' : isValid ? 'success' : 'default';
    const isPassword = type === 'password';
    const [showPassword, setShowPassword] = React.useState(false);

    const inputValue = props.value ?? props.defaultValue ?? '';
    const hasValue = String(inputValue).length > 0;

    const iconPaddingClass = Icon
      ? iconPosition === 'left'
        ? 'pl-9'
        : 'pr-9'
      : '';

    if (isPassword) {
      return (
        <div className="relative group">
          {Icon && (
            <span
              className={cn(
                iconPosition === 'left' ? 'left-3' : 'right-3',
                'absolute top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground pointer-events-none group-focus-within:opacity-100 transition-opacity'
              )}
            >
              <Icon size={16} />
            </span>
          )}
          <input
            type={showPassword ? 'text' : 'password'}
            data-slot="input"
            ref={ref}
            aria-invalid={isError}
            className={cn(
              inputVariants({ size, status, className }),
              iconPaddingClass,
              hasValue && 'pr-10'
            )}
            {...props}
          />
          {hasValue && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                'bg-transparent border-none cursor-pointer p-0',
                'flex items-center justify-center',
                'transition-colors duration-200',
                'text-muted-foreground hover:text-muted-foreground/80'
              )}
            >
              {showPassword ? (
                <MdVisibilityOff size={18} />
              ) : (
                <MdVisibility size={18} />
              )}
            </button>
          )}
        </div>
      );
    }

    if (Icon) {
      return (
        <div className="relative">
          <span
            className={cn(
              iconPosition === 'left' ? 'left-3' : 'right-3',
              'absolute top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground pointer-events-none'
            )}
          >
            <Icon size={16} />
          </span>
          <input
            type={type}
            data-slot="input"
            ref={ref}
            aria-invalid={isError}
            className={cn(
              inputVariants({ size, status, className }),
              iconPaddingClass
            )}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        type={type}
        data-slot="input"
        ref={ref}
        aria-invalid={isError}
        className={cn(inputVariants({ size, status, className }))}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
