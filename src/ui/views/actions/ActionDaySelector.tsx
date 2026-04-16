import { cn } from '@/ui/lib/utils';
import React, { useState } from 'react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { Modal } from './Modal';

interface DayPickerProps {
  selectedDate?: Date | null;
  minDate?: Date;
  maxDate?: Date;
  onDateSelect: (date: Date) => void;
}

export function DayPicker({ selectedDate, onDateSelect }: DayPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d =
      selectedDate && !isNaN(selectedDate.getTime())
        ? selectedDate
        : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPreviousMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const selected = isDateSelected(date);
    const isToday = new Date().toDateString() === date.toDateString();
    const isFuture = date > new Date();

    days.push(
      <button
        key={`${month}-${day}`}
        type="button"
        disabled={isFuture}
        onClick={() => !isFuture && onDateSelect(date)}
        className={cn(
          'h-9 w-9 flex items-center justify-center rounded-full text-[13px] transition-colors',
          selected
            ? 'bg-blue-500 text-white font-semibold'
            : isToday
            ? 'text-blue-500 font-semibold hover:bg-white/5'
            : isFuture
            ? 'text-muted-foreground/30 cursor-not-allowed'
            : 'text-foreground hover:bg-white/5 cursor-pointer'
        )}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-4 select-none">
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
        >
          <LuChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <span className="text-[15px] font-semibold text-foreground">
          {monthNames[month]} {year}
        </span>
        <button
          type="button"
          onClick={goToNextMonth}
          className="p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
        >
          <LuChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {dayNames.map((name) => (
          <div key={name} className="h-9 w-9 flex items-center justify-center">
            <span className="text-[11px] text-muted-foreground">
              {name.charAt(0)}
            </span>
          </div>
        ))}
        {days}
      </div>
    </div>
  );
}

export function ActionDaySelector({
  trigger,
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  className,
}: {
  trigger: React.ReactNode;
  selectedDate?: Date | null;
  onDateSelect: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDateSelect = (date: Date) => {
    onDateSelect(date);
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn('appearance-none cursor-pointer outline-none', className)}
      >
        {trigger}
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Jump to date"
        footer={
          selectedDate && (
            <button
              type="button"
              onClick={() => {
                onDateSelect(null);
                setIsOpen(false);
              }}
              className="w-full py-3.5 text-[15px] font-semibold text-white bg-white/5 hover:bg-white/10 rounded-2xl transition-colors"
            >
              Clear Date
            </button>
          )
        }
      >
        <DayPicker
          selectedDate={selectedDate}
          minDate={minDate}
          maxDate={maxDate}
          onDateSelect={handleDateSelect}
        />
      </Modal>
    </>
  );
}
