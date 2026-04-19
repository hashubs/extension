import { useDebouncedCallback } from '@/ui/hooks/useDebouncedCallback';
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

interface CallbackProps {
  value: string | number;
  handleChange: (value: string) => void;
}

type Value = string | number;
interface Props {
  onChange: (value: string) => void;
  delay?: number;
  value: Value;
  render: (props: CallbackProps) => React.ReactElement;
}

export interface InputHandle {
  setValue: (value: Value) => void;
}

function DebouncedInputComponent(
  { onChange, delay = 500, render, value }: Props,
  ref: React.Ref<InputHandle>
) {
  const [innerValue, setInnerValue] = useState(value);

  useImperativeHandle(ref, () => ({
    setValue: setInnerValue,
  }));

  const debouncedSetValue = useDebouncedCallback((inputValue: string) => {
    onChange(inputValue);
  }, delay);

  useEffect(() => {
    debouncedSetValue.cancel();
    setInnerValue(value);
  }, [value, debouncedSetValue]);

  const handleChange = useCallback(
    (newValue: string) => {
      debouncedSetValue(newValue);
      setInnerValue(newValue);
    },
    [debouncedSetValue]
  );

  return render({
    value: innerValue,
    handleChange,
  });
}

export const DebouncedInput = React.forwardRef(DebouncedInputComponent);
