import { useMnemonicInput } from '@/ui/hooks/useMnemonicInput';

const WORD_COUNT_24 = 24;

interface WordGridProps {
  phraseMode: 12 | 24;
  value: string[];
  setValue: React.Dispatch<React.SetStateAction<string[]>>;
  readOnly?: boolean;
}

export function MnemonicComponent({
  phraseMode,
  value,
  setValue,
  readOnly = false,
}: WordGridProps) {
  const { getInputProps } = useMnemonicInput({
    columns: 3,
    rows: phraseMode === 12 ? 4 : 8,
    maxInputNumber: WORD_COUNT_24,
    setValue,
    type: readOnly ? 'text' : undefined,
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
      {Array.from({ length: WORD_COUNT_24 }, (_, index) => {
        const inputProps = getInputProps(index);
        const isHidden = index >= phraseMode;
        if (isHidden) return null;
        return (
          <div
            key={index}
            className={`flex items-center gap-2 bg-surface-container-low px-3 py-[0.6rem] rounded-lg border border-outline-variant/20 transition-all duration-200 ${
              readOnly
                ? ''
                : 'focus-within:border-primary-container focus-within:ring-2 focus-within:ring-primary/10'
            }`}
          >
            <span className="text-[10px] font-mono text-on-surface-variant w-4 shrink-0 opacity-70 select-none">
              {String(index + 1).padStart(2, '0')}
            </span>
            <input
              {...inputProps}
              id={`word-${index}`}
              name={`word-${index}`}
              className={`flex-1 bg-transparent border-none outline-none text-[0.8125rem] text-on-surface min-w-0 w-full placeholder:text-on-surface-variant/30 placeholder:font-normal ${
                readOnly ? 'cursor-default select-all' : ''
              }`}
              autoComplete="off"
              spellCheck={false}
              value={value[index]}
              readOnly={readOnly}
              tabIndex={readOnly ? -1 : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}
