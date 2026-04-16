import { formatFullDate } from '@/shared/units/format-date';

export function DateComponent({ timestamp }: { timestamp: number }) {
  return (
    <div className="flex items-center justify-between px-2.5 py-2.5 w-full">
      <span className="text-[14px] text-muted-foreground">Date</span>
      <div className="flex items-center gap-1.5 text-[14px] font-bold text-right text-foreground">
        {formatFullDate(timestamp)}
      </div>
    </div>
  );
}
