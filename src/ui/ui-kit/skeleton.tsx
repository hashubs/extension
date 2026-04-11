import { cva, type VariantProps } from 'class-variance-authority';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const skeletonVariants = cva(
  [
    'relative overflow-hidden',
    'after:absolute after:inset-0',
    'after:bg-gradient-to-r after:from-transparent after:to-transparent',
    'after:animate-[shimmer_1.6s_ease-in-out_infinite]',
  ],
  {
    variants: {
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        full: 'rounded-full',
      },
      theme: {
        auto: [
          'bg-gray-200 dark:bg-[#2e2e2e]',
          'after:via-white/60 dark:after:via-white/[0.08]',
        ],
        light: ['bg-gray-200', 'after:via-white/60'],
        dark: ['bg-[#2e2e2e]', 'after:via-white/[0.08]'],
      },
    },
    defaultVariants: {
      rounded: 'md',
      theme: 'auto',
    },
  }
);

type AsProp<E extends React.ElementType> = {
  as?: E;
};

type SkeletonOwnProps = VariantProps<typeof skeletonVariants> & {
  className?: string;
  width?: string | number;
  height?: string | number;
};

type SkeletonProps<E extends React.ElementType = 'div'> = AsProp<E> &
  SkeletonOwnProps &
  Omit<React.ComponentPropsWithoutRef<E>, keyof SkeletonOwnProps | 'as'>;

export function Skeleton<E extends React.ElementType = 'div'>({
  as,
  className,
  rounded,
  theme,
  width,
  height,
  style,
  ...props
}: SkeletonProps<E>) {
  const Component = (as ?? 'div') as React.ElementType;

  return (
    <Component
      className={cn(skeletonVariants({ rounded, theme }), className)}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
}
