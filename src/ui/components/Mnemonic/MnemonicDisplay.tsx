import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/ui/ui-kit';
import { FaChevronDown } from 'react-icons/fa6';

interface MnemonicDisplayProps {
  words: string[];
  revealed?: boolean;
  words24?: boolean;
}

function WordCell({
  word,
  index,
  revealed,
}: {
  word: string;
  index: number;
  revealed: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 bg-surface-container-low px-3 py-2.5 rounded-lg border border-white/10 transition-[border-color,box-shadow] duration-200 focus-within:border-primary-container focus-within:shadow-[0_0_0_2px_rgba(15,61,62,0.1)]">
      <span className="text-[10px] font-mono text-on-surface-variant w-4 shrink-0 opacity-70 select-none">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="flex-1 text-sm font-semibold text-on-surface font-['Inter'] min-w-0 w-full">
        {revealed ? word : '••••••'}
      </span>
    </div>
  );
}

export function MnemonicDisplay({
  words,
  revealed = false,
  words24 = false,
}: MnemonicDisplayProps) {
  const first12 = words.slice(0, 12);
  const last12 = words.slice(12, 24);

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        {first12.map((word, i) => (
          <WordCell key={i} word={word} index={i} revealed={revealed} />
        ))}
      </div>

      {words24 && (
        <Collapsible>
          <CollapsibleContent>
            <div className="grid grid-cols-3 gap-2 pt-2">
              {last12.map((word, i) => (
                <WordCell
                  key={i + 12}
                  word={word}
                  index={i + 12}
                  revealed={revealed}
                />
              ))}
            </div>
          </CollapsibleContent>

          <CollapsibleTrigger className="flex items-center justify-center gap-1.5 w-full bg-transparent border-none text-on-surface-variant text-sm font-medium py-2 cursor-pointer hover:opacity-70 transition-opacity duration-200 font-['Inter']">
            <FaChevronDown
              className="transition-transform duration-200 in-data-open:rotate-180"
              style={{ width: 14, height: 14 }}
            />
            <span className="in-data-open:hidden">Show 24 words</span>
            <span className="hidden in-data-open:inline">Show 12 words</span>
          </CollapsibleTrigger>
        </Collapsible>
      )}
    </div>
  );
}
