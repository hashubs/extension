import { cn } from '@/ui/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

const inputVariants = cva(
  'flex w-full rounded-lg bg-primary dark:bg-input/30 border border-input transition-all outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus:ring-3 disabled:cursor-not-allowed disabled:opacity-45',
  {
    variants: {
      size: {
        sm: 'h-8 px-2.5 py-1 text-xs',
        md: 'h-9 md:h-10 px-3 py-2 text-sm',
        lg: 'h-10 md:h-12 px-4 md:py-3 text-sm md:text-base',
        xl: 'h-12 md:h-14 px-5 md:py-4 text-base md:text-lg',
      },
      status: {
        default:
          'focus:border-muted-foreground/10 focus:ring-[rgba(15,61,62,0.1)]',
        error:
          'border-[rgba(186,26,26,0.5)] focus:border-[rgba(186,26,26,0.6)] focus:ring-[rgba(186,26,26,0.1)]',
        success:
          'border-[rgba(15,61,62,0.4)] focus:border-muted-foreground/10 focus:ring-[rgba(15,61,62,0.1)]',
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
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, isError, isValid, ...props }, ref) => {
    const status = isError ? 'error' : isValid ? 'success' : 'default';
    const isPassword = type === 'password';
    const [showPassword, setShowPassword] = React.useState(false);

    const inputValue = props.value ?? props.defaultValue ?? '';
    const hasValue = String(inputValue).length > 0;

    if (isPassword) {
      return (
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            data-slot="input"
            ref={ref}
            aria-invalid={isError}
            className={cn(
              inputVariants({ size, status, className }),
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
                'text-[rgba(113,121,120,0.6)] hover:text-primary-2'
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
