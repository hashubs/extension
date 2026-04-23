import { wordlists } from 'ethers';
import { useCallback, useEffect, useRef, useState } from 'react';

export type SecretMode = 'idle' | 'key' | 'seed';

export interface UseSecretInputOptions {
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export type GridSize = 12 | 15 | 18 | 21 | 24;

export interface UseSecretInputReturn {
  mode: SecretMode;
  revealed: boolean;
  showGrid: boolean;
  gridSize: GridSize;
  words: string[];
  invalidIndices: number[];
  focusedIndex: number | null;
  currentValue: string;

  singleRef: React.RefObject<HTMLInputElement>;
  wordRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;

  setRevealed: (revealed: boolean | ((prev: boolean) => boolean)) => void;
  setFocusedIndex: (idx: number | null) => void;
  handleSingleChange: (val: string) => void;
  handleSinglePaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  handleWordChange: (idx: number, val: string) => void;
  handleWordKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => void;
  handleWordPaste: (
    e: React.ClipboardEvent<HTMLInputElement>,
    startIdx: number
  ) => void;
}

function detectMode(value: string): SecretMode {
  const trimmed = value.trim();
  if (!trimmed) return 'idle';
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return 'seed';
  return 'key';
}

function cleanAndSplitMnemonic(value: string): string[] {
  return value
    .replace(/[\r\n,]/g, ' ')
    .replace(/^\d+\.\s+/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

function getBestGridSize(count: number): GridSize {
  if (count <= 12) return 12;
  if (count <= 15) return 15;
  if (count <= 18) return 18;
  if (count <= 21) return 21;
  return 24;
}

function parseWords(value: string): { words: string[]; size: GridSize } {
  const ws = cleanAndSplitMnemonic(value);
  const size = getBestGridSize(ws.length);
  const words = Array(24).fill('');
  ws.slice(0, size).forEach((w, i) => {
    words[i] = w.toLowerCase();
  });
  return { words, size };
}

export function useSecretInput(
  opts: UseSecretInputOptions = {}
): UseSecretInputReturn {
  const isControlled = opts.value !== undefined;
  const readOnly = opts.readOnly ?? false;

  const initValue = opts.value ?? opts.defaultValue ?? '';
  const initMode = detectMode(initValue);
  const initIsSeed = initMode === 'seed';
  const initParsed = initIsSeed ? parseWords(initValue) : null;

  const [mode, setMode] = useState<SecretMode>(initMode);
  const [revealed, setRevealed] = useState(false);
  const [gridSize, setGridSize] = useState<GridSize>(initParsed?.size ?? 12);
  const [showGrid, setShowGrid] = useState(initIsSeed);
  const [internalValue, setInternalValue] = useState(
    isControlled ? '' : initValue
  );
  const [words, setWords] = useState<string[]>(
    initParsed?.words ?? Array(24).fill('')
  );
  const [invalidIndices, setInvalidIndices] = useState<number[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const singleRef = useRef<HTMLInputElement>(null);
  const wordRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Validasi kata setiap kali array 'words' berubah
  useEffect(() => {
    if (mode !== 'seed') {
      setInvalidIndices([]);
      return;
    }
    const invalid: number[] = [];
    words.slice(0, gridSize).forEach((word, i) => {
      const w = word.trim().toLowerCase();
      if (w && wordlists.en.getWordIndex(w) < 0) {
        invalid.push(i);
      }
    });
    setInvalidIndices(invalid);
  }, [words, gridSize, mode]);

  useEffect(() => {
    if (!isControlled) return;
    const val = opts.value ?? '';
    const newMode = detectMode(val);
    setMode(newMode);
    if (newMode === 'seed') {
      const { words: ws, size } = parseWords(val);
      setGridSize(size);
      setWords(ws);
      setShowGrid(true);
    } else {
      setShowGrid(false);
      setWords(Array(24).fill(''));
    }
  }, [opts.value]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentValue = isControlled ? opts.value ?? '' : internalValue;

  const emitChange = useCallback(
    (val: string) => {
      if (!isControlled) setInternalValue(val);
      opts.onChange?.(val);
    },
    [isControlled, opts.onChange] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const focusSingle = () => setTimeout(() => singleRef.current?.focus(), 0);
  const focusWord = (idx: number) =>
    setTimeout(() => wordRefs.current[idx]?.focus(), 0);

  const isEmpty = (ws: string[], size: number) =>
    ws.slice(0, size).every((v) => !v.trim());

  const resetToSingle = useCallback(() => {
    setShowGrid(false);
    setWords(Array(24).fill(''));
    setMode('idle');
    emitChange('');
    focusSingle();
  }, [emitChange]);

  const switchToSeed = useCallback(
    (incomingRaw: string[]) => {
      const incoming = incomingRaw.map((v) => v.toLowerCase());
      const size = getBestGridSize(incoming.length);
      const next = Array(24).fill('');
      incoming.slice(0, size).forEach((w, i) => (next[i] = w));
      setGridSize(size);
      setWords(next);
      setShowGrid(true);
      setMode('seed');
      emitChange(incoming.slice(0, size).join(' '));
      focusWord(Math.min(incoming.length, size - 1));
    },
    [emitChange]
  );

  const handleSingleChange = useCallback(
    (val: string) => {
      if (readOnly) return;
      emitChange(val);
      const ws = cleanAndSplitMnemonic(val);
      if (ws.length >= 2) {
        switchToSeed(ws);
      } else if (val.trim() && !val.includes(' ')) {
        setMode('key');
        if (!isControlled) setInternalValue(val);
      } else if (!val.trim()) {
        setMode('idle');
        if (!isControlled) setInternalValue(val);
      }
    },
    [readOnly, emitChange, switchToSeed, isControlled]
  );

  const handleSinglePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (readOnly) return;
      const val = e.clipboardData.getData('text');
      const ws = cleanAndSplitMnemonic(val);
      if (ws.length >= 2) {
        e.preventDefault();
        switchToSeed(ws);
      }
    },
    [readOnly, switchToSeed]
  );

  const handleWordChange = useCallback(
    (idx: number, val: string) => {
      if (readOnly) return;
      setWords((prev) => {
        const next = [...prev];
        next[idx] = val.trim().toLowerCase();
        if (isEmpty(next, gridSize)) {
          resetToSingle();
          return prev;
        }
        emitChange(next.slice(0, gridSize).join(' ').trim());
        return next;
      });
    },
    [readOnly, gridSize, emitChange, resetToSingle]
  );

  const handleWordKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
      if (readOnly) return;
      if (e.key === ' ' || e.key === 'Tab') {
        e.preventDefault();
        const nextIdx = idx + 1;
        if (nextIdx < gridSize) {
          wordRefs.current[nextIdx]?.focus();
        }
      }
      if (e.key === 'Backspace' && words[idx] === '') {
        e.preventDefault();
        if (idx === 0) {
          if (isEmpty(words, gridSize)) resetToSingle();
        } else {
          setWords((prev) => {
            const next = [...prev];
            next[idx - 1] = '';
            return next;
          });
          wordRefs.current[idx - 1]?.focus();
        }
      }
    },
    [readOnly, words, gridSize, resetToSingle]
  );

  const handleWordPaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>, startIdx: number) => {
      if (readOnly) return;
      const val = e.clipboardData.getData('text');
      const ws = cleanAndSplitMnemonic(val).map((v) => v.toLowerCase());
      if (ws.length > 1) {
        e.preventDefault();
        setWords((prev) => {
          const next = [...prev];
          ws.forEach((w, i) => {
            if (startIdx + i < 24) next[startIdx + i] = w;
          });
          const newSize = getBestGridSize(
            next.filter((w, i) => i < 24 && w !== '').length
          );
          setGridSize(newSize);
          emitChange(next.slice(0, newSize).join(' ').trim());
          return next;
        });
      }
    },
    [readOnly, emitChange]
  );

  return {
    mode,
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
  };
}
