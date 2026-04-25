import { cn } from '@/ui/lib/utils';
import type { RefObject } from 'react';

interface PinnedSearchBodyProps {
  searchRef: RefObject<HTMLDivElement>;
  searchPinned: boolean;
  children: React.ReactNode;
  className?: string;
}

export function PinnedSearchBody({
  searchRef,
  searchPinned,
  children,
  className,
}: PinnedSearchBodyProps) {
  return (
    <div
      ref={searchRef}
      className={cn('px-4', className)}
      style={{
        opacity: searchPinned ? 0 : 1,
        pointerEvents: searchPinned ? 'none' : 'auto',
        transition: 'opacity 0.25s ease',
      }}
    >
      {children}
    </div>
  );
}

interface PinnedSearchHeaderProps {
  searchPinned: boolean;
  title?: string;
  children: React.ReactNode;
}

export function PinnedSearchHeader({
  searchPinned,
  title,
  children,
}: PinnedSearchHeaderProps) {
  return (
    <div
      className="relative flex-1 flex items-center justify-center overflow-hidden"
      style={{ height: '32px' }}
    >
      {title && (
        <h1
          className="absolute text-base font-semibold tracking-wide transition-all duration-300 ease-in-out whitespace-nowrap"
          style={{
            opacity: searchPinned ? 0 : 1,
            transform: searchPinned ? 'translateY(-10px)' : 'translateY(0px)',
            pointerEvents: searchPinned ? 'none' : 'auto',
          }}
        >
          {title}
        </h1>
      )}
      <div
        className="absolute w-full transition-all duration-300 ease-in-out"
        style={{
          opacity: searchPinned ? 1 : 0,
          transform: searchPinned ? 'translateY(0px)' : 'translateY(10px)',
          pointerEvents: searchPinned ? 'auto' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}
