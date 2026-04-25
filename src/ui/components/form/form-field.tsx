import { cn } from '@/ui/lib/utils/cn';
import { Input, type InputProps } from '@/ui/ui-kit';
import { forwardRef, useId } from 'react';

interface FormFieldProps extends InputProps {
  label: string;
  error?: string;
  wrapperClassName?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    { label, error, wrapperClassName, hidden, ...props }: FormFieldProps,
    ref
  ) => {
    const id = useId();
    return (
      <div
        className={cn(
          'flex flex-col gap-1.5 focus-within:text-primary transition-colors',
          wrapperClassName
        )}
        hidden={hidden}
      >
        <label
          htmlFor={id}
          className="text-xs font-semibold px-1 uppercase tracking-wider text-muted-foreground"
        >
          {label}
        </label>
        <Input ref={ref} id={id} isError={!!error} {...props} size="md" />
        {error && (
          <span className="text-xs text-destructive px-1 mt-0.5">{error}</span>
        )}
      </div>
    );
  }
);
