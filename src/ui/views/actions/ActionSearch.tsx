import { useDebouncedCallback } from '@/ui/hooks/useDebouncedCallback';
import { Input } from '@/ui/ui-kit';
import React, { useLayoutEffect, useRef } from 'react';
import { LuSearch } from 'react-icons/lu';

export function ActionSearch({
  value,
  onFocus,
  onChange,
  searchPinned,
}: {
  value?: string;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onChange(value: string): void;
  searchPinned?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debouncedHandleChange = useDebouncedCallback(onChange, 300);

  useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = value || '';
    }
  }, [value]);

  return (
    <Input
      ref={inputRef}
      type="search"
      placeholder="Search"
      size={searchPinned ? 'sm' : 'md'}
      status="default"
      defaultValue={value}
      onFocus={onFocus}
      onChange={(event) => {
        debouncedHandleChange(event.currentTarget.value);
      }}
      icon={LuSearch}
    />
  );
}
