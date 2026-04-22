import { useRef, useState } from 'react';

type Props = {
  count?: 12 | 24;
  words?: string[];
  onChange?: (words: string[]) => void;
  readOnly?: boolean;
};

export function MnemonicGrid({
  count = 12,
  words: externalWords,
  onChange,
  readOnly = false,
}: Props) {
  const [internal, setInternal] = useState<string[]>(Array(count).fill(''));
  const isControlled = externalWords !== undefined;
  const words = isControlled ? externalWords : internal;

  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const setWords = (updated: string[]) => {
    if (isControlled) onChange?.(updated);
    else setInternal(updated);
  };

  const handleChange = (index: number, value: string) => {
    const updated = [...words];
    updated[index] = value;
    setWords(updated);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'Backspace' && words[index] === '' && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if ((e.key === ' ' || e.key === 'Enter') && index < count - 1) {
      e.preventDefault();
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    const split = pasted.trim().split(/\s+/).slice(0, count);
    if (split.length > 1) {
      e.preventDefault();
      const updated = Array(count).fill('');
      split.forEach((w, i) => {
        updated[i] = w;
      });
      setWords(updated);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-2 border border-border rounded-md px-3 py-2"
        >
          <span className="text-muted-foreground text-sm font-mono w-6 shrink-0">
            {i + 1}.
          </span>
          {readOnly ? (
            <span className="text-foreground text-sm font-mono">
              {words[i]}
            </span>
          ) : (
            <input
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="text"
              value={words[i] ?? ''}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
              className="bg-transparent text-sm font-mono w-full outline-none"
            />
          )}
        </div>
      ))}
    </div>
  );
}
