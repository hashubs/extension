import { cn } from "@/ui/lib/utils";
import React from "react";
import type { IconType } from "react-icons";

type ItemBase = {
  iconRight?: IconType;
  label: string;
  subLabel?: string;
  onClick?: () => void;
  onClickIconRight?: () => void;
  badge?: React.ReactNode;
  iconClassName?: string;
  iconRightClassName?: string;
  variant?: "default" | "danger";
  className?: string;
  transition?: boolean;
  rightElement?: React.ReactNode;
  disabled?: boolean;
};

type ItemWithIcon = ItemBase & { icon: IconType; imgUrl?: never };
type ItemWithImage = ItemBase & { imgUrl: string | undefined; icon?: never };
type ItemWithNeither = ItemBase & { icon?: never; imgUrl?: never };

export type ItemType = ItemWithIcon | ItemWithImage | ItemWithNeither;

export function Image({
  src,
  alt,
  className,
  disabled,
}: {
  src: string | undefined;
  alt: string;
  className?: string;
  disabled?: boolean;
}) {
  const [hasError, setHasError] = React.useState(false);

  // Reset error state when src changes
  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError) {
    return (
      <div
        className={cn(
          "size-7 rounded-full bg-black/5! dark:bg-white/5! border border-muted/50 flex items-center justify-center",
          className,
        )}
      >
        <span className="text-xs font-semibold text-foreground">
          {alt.slice(0, 1).toUpperCase()}
        </span>
      </div>
    );
  }

  if (!src) {
    return (
      <div
        className={cn(
          "size-7 rounded-full bg-black/5! dark:bg-white/5! border border-muted/50 flex items-center justify-center",
          className,
        )}
      >
        <span className="text-xs font-semibold text-foreground">
          {alt.slice(0, 1).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex-none size-7 overflow-hidden", className)}>
      <img
        key={src}
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover rounded-full",
          disabled && "grayscale",
        )}
        onError={() => setHasError(true)}
      />
    </div>
  );
}

type ImageStackProps = {
  images: { src?: string; alt: string }[];
  max?: number;
  className?: string;
};

export function ImageStack({ images, max = 4, className }: ImageStackProps) {
  const visible = images.slice(0, max);
  const remaining = images.length - visible.length;

  return (
    <div className="flex">
      {visible.map((image, i) => {
        const isLast = i === visible.length - 1 && remaining === 0;

        return (
          <div
            key={i}
            style={{
              marginRight: isLast ? 0 : -10,
              zIndex: visible.length - i,
            }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              className={cn("size-9 ring-2 ring-background", className)}
            />
          </div>
        );
      })}

      {remaining > 0 && (
        <div
          className={cn(
            "size-9 bg-muted ring-2 ring-background flex items-center justify-center text-xs font-medium",
            className,
          )}
          style={{ zIndex: 0 }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}