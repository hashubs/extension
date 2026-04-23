import { useCopyToClipboard } from '@/ui/hooks/useCopyToClipboard';
import { useSecretInput } from '@/ui/hooks/useSecretInput';
import { memo, ReactNode } from 'react';
import { LuCheck, LuCopy, LuEye, LuEyeOff } from 'react-icons/lu';

interface RevealButtonProps {
  revealed: boolean;
  onToggle: () => void;
}

const RevealButton = memo(({ revealed, onToggle }: RevealButtonProps) => (
  <button
    type="button"
    onClick={onToggle}
    title={revealed ? 'Hide' : 'Show'}
    className={`w-11 h-11 shrink-0 rounded-lg border flex items-center justify-center cursor-pointer transition-colors ${
      revealed
        ? 'border-indigo-400 text-indigo-500 bg-indigo-50'
        : 'border-gray-200 text-gray-400 bg-gray-50 hover:bg-gray-100'
    }`}
  >
    {revealed ? <LuEyeOff size={16} /> : <LuEye size={16} />}
  </button>
));

RevealButton.displayName = 'RevealButton';

interface WordInputProps {
  index: number;
  value: string;
  revealed: boolean;
  isFocused: boolean;
  isInvalid?: boolean;
  readOnly?: boolean;
  name?: string;
  onChange: (idx: number, val: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>, idx: number) => void;
  onFocus: (idx: number) => void;
  onBlur: () => void;
  inputRef: (el: HTMLInputElement | null) => void;
}

const WordInput = memo(
  ({
    index,
    value,
    revealed,
    isFocused,
    isInvalid,
    readOnly = false,
    name,
    onChange,
    onKeyDown,
    onPaste,
    onFocus,
    onBlur,
    inputRef,
  }: WordInputProps) => (
    <div
      className={`flex items-stretch border rounded-lg overflow-hidden transition-all ${
        isInvalid
          ? 'border-red-500/50 bg-red-500/5 focus-within:border-red-500 focus-within:ring-1.75 focus-within:ring-red-500/20'
          : readOnly
          ? 'border-input'
          : 'border-input bg-input/80 focus-within:border-teal-600 focus-within:ring-1.75 focus-within:ring-teal-800'
      }`}
    >
      <div
        className={`w-8 min-w-[2rem] flex items-center justify-center text-[11px] border-r select-none shrink-0 ${
          isInvalid
            ? 'bg-red-500 text-white border-red-500/20'
            : 'bg-accent text-accent-foreground border-border'
        }`}
      >
        {index + 1}
      </div>
      <input
        ref={inputRef}
        name={name}
        type={revealed || isFocused ? 'text' : 'password'}
        className={`flex-1 min-w-0 h-10 px-2.5 text-sm font-mono text-foreground outline-none placeholder:text-muted-foreground/50 ${
          readOnly ? 'bg-input/40 cursor-default select-all' : 'bg-input/50'
        }`}
        autoComplete="off"
        spellCheck={false}
        placeholder={readOnly ? '—' : `word ${index + 1}`}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(index, e.target.value)}
        onKeyDown={(e) => onKeyDown(e, index)}
        onPaste={(e) => onPaste(e, index)}
        onFocus={() => onFocus(index)}
        onBlur={onBlur}
        tabIndex={readOnly ? -1 : undefined}
      />
    </div>
  )
);

WordInput.displayName = 'WordInput';

export interface SecretInputProps {
  /** HTML name — registers value in FormData when inside a <form> */
  name?: string;
  /** Mark field as required for native form validation */
  required?: boolean;
  /** Initial value (uncontrolled). Do NOT combine with `value`. */
  defaultValue?: string;
  /** Current value (controlled). Pair with `onChange`. */
  value?: string;
  /** Called on every change (controlled). */
  onChange?: (value: string) => void;
  /** Render as read-only display — no editing allowed */
  readOnly?: boolean;
  /** Auto-focus the input on mount */
  autoFocus?: boolean;
  /** Show the eye toggle button (hidden in readOnly mode automatically) */
  showRevealElement?: boolean;
  /** Show a copy to clipboard button */
  showCopyButton?: boolean;
  /** Label rendered above the input */
  label?: ReactNode;
  /** Hint or error rendered below the input */
  hint?: ReactNode;
}

export function SecretInput({
  name,
  required,
  defaultValue,
  value,
  onChange,
  readOnly = false,
  autoFocus = false,
  showRevealElement = true,
  showCopyButton = false,
  label,
  hint,
}: SecretInputProps) {
  const {
    revealed,
    showGrid,
    gridSize,
    words,
    invalidIndices,
    focusedIndex,
    currentValue,
    singleRef,
    wordRefs,
    setRevealed,
    setFocusedIndex,
    handleSingleChange,
    handleSinglePaste,
    handleWordChange,
    handleWordKeyDown,
    handleWordPaste,
  } = useSecretInput({ defaultValue, value, onChange, readOnly });

  const { handleCopy, isSuccess: isCopySuccess } = useCopyToClipboard({
    text: currentValue,
  });

  const canShowReveal =
    showRevealElement && (currentValue.length > 0 || showGrid);
  const canShowCopy = showCopyButton && currentValue.length > 0;

  return (
    <div className="flex flex-col gap-2 w-full">
      {name && (
        <input
          type="hidden"
          name={name}
          value={currentValue}
          required={required}
        />
      )}

      {label && (
        <div className="text-muted-foreground text-sm mt-1 leading-relaxed">
          {label}
        </div>
      )}

      {!showGrid && (
        <div className="flex gap-2 items-start">
          <textarea
            ref={singleRef as any}
            className={`flex-1 min-h-[80px] py-2.5 px-3.5 rounded-lg border text-sm font-mono bg-input text-muted-foreground outline-none transition-all placeholder:text-muted-foreground/50 resize-none ${
              readOnly
                ? 'border-input/50 cursor-default select-all'
                : 'border-input focus:border-teal-600 focus:ring-1.75 focus:ring-teal-800'
            }`}
            style={
              {
                WebkitTextSecurity: revealed ? 'none' : 'disc',
              } as any
            }
            placeholder={
              readOnly ? '—' : '0x… or first word of your seed phrase'
            }
            value={currentValue}
            readOnly={readOnly}
            onChange={(e) => handleSingleChange(e.target.value)}
            onPaste={handleSinglePaste as any}
            autoFocus={autoFocus}
            autoComplete="off"
            spellCheck={false}
            tabIndex={readOnly ? -1 : undefined}
          />
        </div>
      )}

      {showGrid && (
        <div
          className={`grid grid-cols-2 gap-2 ${
            readOnly ? 'pointer-events-none' : ''
          }`}
        >
          {Array.from({ length: gridSize }, (_, i) => (
            <WordInput
              key={i}
              index={i}
              value={words[i]}
              revealed={revealed}
              isFocused={focusedIndex === i}
              isInvalid={invalidIndices.includes(i)}
              readOnly={readOnly}
              onChange={handleWordChange}
              onKeyDown={handleWordKeyDown}
              onPaste={handleWordPaste}
              onFocus={setFocusedIndex}
              onBlur={() => setFocusedIndex(null)}
              inputRef={(el) => {
                wordRefs.current[i] = el;
              }}
            />
          ))}
        </div>
      )}

      {(canShowReveal || canShowCopy) && (
        <div className="flex justify-between items-center mt-0.5 px-0.5 select-none">
          {canShowReveal ? (
            <button
              type="button"
              onClick={() => setRevealed((r) => !r)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {revealed ? (
                <>
                  <LuEyeOff size={14} className="opacity-70" />
                  <span>Hide {showGrid ? 'seed phrase' : 'private key'}</span>
                </>
              ) : (
                <>
                  <LuEye size={14} className="opacity-70" />
                  <span>Show {showGrid ? 'seed phrase' : 'private key'}</span>
                </>
              )}
            </button>
          ) : (
            <div />
          )}

          {canShowCopy && (
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {isCopySuccess ? (
                <>
                  <LuCheck size={14} className="text-teal-500" />
                  <span className="text-teal-500">Copied!</span>
                </>
              ) : (
                <>
                  <LuCopy size={14} className="opacity-70" />
                  <span>Copy to clipboard</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {hint}
    </div>
  );
}
