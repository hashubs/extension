import { cn } from '@/ui/lib/utils';
import type { ForwardedRef } from 'react';
import React from 'react';

interface Props extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  label: JSX.Element | string;
  input: JSX.Element;
  htmlFor: string;
}

function handleInputWrapperClick(
  event: React.MouseEvent<HTMLFieldSetElement, MouseEvent>
) {
  if (event.target === event.currentTarget) {
    const input = event.currentTarget.querySelector('input');
    if (input) {
      input.focus();
    }
  }
}

function InputDecoratorComponent(
  { className, label, input, htmlFor, ...props }: Props,
  ref: ForwardedRef<HTMLFieldSetElement>
) {
  return (
    <fieldset
      ref={ref}
      onClick={handleInputWrapperClick}
      className={cn(
        'rounded-xl border border-input bg-input px-3 py-2',
        className
      )}
      {...props}
    >
      {label ? (
        <label
          htmlFor={htmlFor}
          className="block text-muted-foreground text-[12px] leading-[16px] font-normal tracking-[0.38px]"
        >
          {label}
        </label>
      ) : null}
      <div className="text-sm leading-[24px] font-medium tracking-[0.25px]">
        {input}
      </div>
    </fieldset>
  );
}

export const InputDecorator = React.forwardRef(InputDecoratorComponent);
