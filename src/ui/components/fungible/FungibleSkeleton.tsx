import { shimmerStyle } from '../ShimmerStyle';

export function FungibleItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-[17px] cursor-default bg-item border border-border/20">
      <div className="flex items-center gap-3">
        <div
          className="relative size-[42px] rounded-full flex items-center justify-center shrink-0"
          style={shimmerStyle}
        />

        <div className="flex flex-col gap-1.5">
          <div style={{ ...shimmerStyle, width: 56, height: 14 }} />

          <div className="flex items-center gap-1.5">
            <div style={{ ...shimmerStyle, width: 52, height: 12 }} />
            <div style={{ ...shimmerStyle, width: 40, height: 12 }} />
          </div>
        </div>
      </div>

      <div className="text-right flex flex-col items-end gap-1.5">
        <div style={{ ...shimmerStyle, width: 72, height: 14 }} />
        <div style={{ ...shimmerStyle, width: 52, height: 12 }} />
      </div>
    </div>
  );
}

export function FungibleListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <FungibleItemSkeleton key={i} />
      ))}
    </div>
  );
}
