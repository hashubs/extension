import { cn } from '@/ui/lib/utils';
import { Card, CardItem } from '@/ui/ui-kit';
import React, { useState } from 'react';
import { LuCheck } from 'react-icons/lu';
import { Modal } from './Modal';

interface Option {
  value: string;
  label: string;
  icon?: string;
}

interface ActionSelectorProps {
  title: string;
  trigger: React.ReactNode;
  options: Option[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multi?: boolean;
  className?: string;
}

export function ActionSelector({
  title,
  trigger,
  options,
  value,
  onChange,
  multi = false,
  className,
}: ActionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (optionValue: string) => {
    if (multi) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(optionValue)) {
        onChange(currentValues.filter((v) => v !== optionValue));
      } else {
        onChange([...currentValues, optionValue]);
      }
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const isSelected = (optionValue: string) => {
    if (multi) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          'appearance-none cursor-pointer outline-none w-full',
          className
        )}
      >
        {trigger}
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={title}>
        <div className="max-h-[60vh] overflow-y-auto pr-1">
          <Card className="overflow-hidden divide-y-0">
            {options.map((option) => {
              const selected = isSelected(option.value);
              return (
                <CardItem
                  key={option.value}
                  item={{
                    label: option.label,
                    imgUrl: option.icon,
                    onClick: () => handleSelect(option.value),
                    iconRight: selected ? LuCheck : undefined,
                    className: selected ? 'bg-black/5 dark:bg-white/5' : '',
                  }}
                />
              );
            })}
          </Card>
        </div>
      </Modal>
    </>
  );
}
