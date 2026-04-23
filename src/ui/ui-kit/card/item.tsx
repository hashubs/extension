import { cn } from '@/ui/lib/utils';
import { Image } from '@/ui/ui-kit/image';
import type { IconType } from 'react-icons';

type ItemBase = {
  id?: string;
  iconRight?: IconType;
  label: React.ReactNode;
  subLabel?: string;
  subLabelElement?: React.ReactNode;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onClickIconRight?: () => void;
  badge?: React.ReactNode;
  iconClassName?: string;
  iconRightClassName?: string;
  variant?: 'default' | 'danger';
  className?: string;
  transition?: boolean;
  rightElement?: React.ReactNode;
  disabled?: boolean;
  classNameLabel?: string;
  isItemStart?: boolean;
};

type ItemWithIcon = ItemBase & {
  icon: IconType;
  iconNode?: never;
  imgUrl?: never;
};
type ItemWithIconNode = ItemBase & {
  iconNode: React.ReactNode;
  icon?: never;
  imgUrl?: never;
};
type ItemWithImage = ItemBase & {
  imgUrl: string | undefined;
  icon?: never;
  iconNode?: never;
};
type ItemWithNeither = ItemBase & {
  icon?: never;
  iconNode?: never;
  imgUrl?: never;
};

export type ItemType =
  | ItemWithIcon
  | ItemWithIconNode
  | ItemWithImage
  | ItemWithNeither;

export function CardItem({ item }: { item: ItemType }) {
  const IconRight = item.iconRight;
  const isDanger = item.variant === 'danger';
  const disabled = item.disabled;

  return (
    <div
      id={item.id}
      role="button"
      tabIndex={0}
      onClick={item.onClick}
      onMouseEnter={item.onMouseEnter}
      className={cn(
        'w-full px-2.5 py-2.5 flex items-center justify-between group text-left outline-none focus:outline-none',
        'transition-all',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        !disabled &&
          (isDanger
            ? 'hover:bg-red-500/5 dark:hover:bg-red-500/10'
            : 'hover:bg-black/5 dark:hover:bg-white/5'),
        item.className
      )}
    >
      <div
        className={cn(
          'flex items-center gap-3',
          item.isItemStart ? 'items-start' : 'items-center'
        )}
      >
        {'imgUrl' in item && item.imgUrl !== undefined ? (
          <Image
            src={item.imgUrl}
            alt={typeof item.label === 'string' ? item.label : ''}
            disabled={disabled}
          />
        ) : 'iconNode' in item && item.iconNode ? (
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shrink-0',
              item.iconClassName
            )}
          >
            {item.iconNode}
          </div>
        ) : 'icon' in item && item.icon ? (
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              'transition-colors',
              item.iconClassName ??
                (isDanger
                  ? 'bg-linear-to-br from-red-500/20 to-red-600/10 text-red-400 border border-red-500/10'
                  : 'border border-muted-foreground/10')
            )}
          >
            <item.icon size={15} />
          </div>
        ) : null}

        <div className="flex flex-col">
          <span
            className={cn(
              'flex items-center gap-2 text-sm',
              'transition-colors',
              isDanger ? 'text-red-400' : 'text-foreground/90',
              !disabled &&
                (isDanger
                  ? 'group-hover:text-red-300'
                  : 'group-hover:text-foreground'),
              item.classNameLabel
            )}
          >
            {item.label}
          </span>
          {item.subLabel && (
            <span
              className={cn(
                'text-xs text-muted-foreground max-w-[200px]',
                !item.isItemStart && 'truncate'
              )}
            >
              {item.subLabel}
            </span>
          )}
          {item.subLabelElement}
        </div>
      </div>

      <div className="flex items-center gap-2.5 text-foreground/50">
        {item.badge}
        {IconRight && (
          <IconRight
            size={15}
            className={cn(
              !disabled && 'group-hover:text-foreground',
              item.transition !== false && !disabled
                ? 'group-hover:translate-x-0.5 transition-all'
                : 'transition-none',
              item.iconRightClassName
            )}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) item.onClickIconRight?.();
            }}
          />
        )}
        {item.rightElement}
      </div>
    </div>
  );
}
