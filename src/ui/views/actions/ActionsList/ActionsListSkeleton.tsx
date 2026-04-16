import { shimmerStyle } from '@/ui/components/ShimmerStyle';

export function ActionItemSkeleton() {
  return (
    <div
      className="grid gap-6 items-center px-4 py-2 relative select-none w-full border-b border-border/5 last:border-0"
      style={{
        height: 66,
        gridTemplateColumns:
          'minmax(min-content, max-content) minmax(100px, max-content)',
        justifyContent: 'space-between',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-9 rounded-full shrink-0" style={shimmerStyle} />

        <div className="flex flex-col gap-2 min-w-0 justify-center">
          <div
            style={{ ...shimmerStyle, width: 100, height: 14, borderRadius: 4 }}
          />
          <div className="flex items-center gap-1.5">
            <div
              style={{
                ...shimmerStyle,
                width: 14,
                height: 14,
                borderRadius: '50%',
              }}
            />
            <div
              style={{
                ...shimmerStyle,
                width: 60,
                height: 12,
                borderRadius: 4,
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end shrink-0 justify-center text-right gap-2 overflow-hidden min-w-[120px]">
        <div
          style={{ ...shimmerStyle, width: 80, height: 14, borderRadius: 4 }}
        />
        <div
          style={{ ...shimmerStyle, width: 50, height: 12, borderRadius: 4 }}
        />
      </div>
    </div>
  );
}

export function ActionsListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="flex flex-col">
      {/* Date Header Skeleton */}
      <div className="px-4 py-2 mt-2">
        <div
          style={{ ...shimmerStyle, width: 100, height: 16, borderRadius: 4 }}
        />
      </div>

      <div className="flex flex-col">
        {Array.from({ length: count }).map((_, i) => (
          <ActionItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
