import { cn } from '@/ui/lib/utils';
import { ComponentPropsWithoutRef, forwardRef } from 'react';
import { Header } from '../header';

type LayoutProps = {
  children: React.ReactNode;
  title?: string;
  onBack?: () => void;
  className?: string;
  headerClassName?: string;
  classNameWrapper?: string;
  renderHeaderElement?: React.ReactNode;
  wrapped?: boolean;
} & ComponentPropsWithoutRef<'div'>;

export const Layout = forwardRef<HTMLDivElement, LayoutProps>(
  (
    {
      children,
      title,
      onBack,
      className,
      classNameWrapper,
      headerClassName,
      renderHeaderElement,
      wrapped = true,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col w-full h-full p-4 space-y-4 overflow-y-auto',
          (title || onBack || renderHeaderElement) && 'pt-0!',
          className
        )}
        {...props}
      >
        {(title || onBack || renderHeaderElement) && (
          <Header
            title={title}
            onBack={onBack}
            renderElement={renderHeaderElement}
            className={headerClassName}
          />
        )}
        {wrapped ? (
          <div className={cn('space-y-4', classNameWrapper)}>{children}</div>
        ) : (
          children
        )}
      </div>
    );
  }
);

Layout.displayName = 'Layout';

// export function Layouts({
//   children,
//   title,
//   onBack,
//   className,
//   headerClassName,
//   classNameWrapper,
//   renderHeaderElement,
//   wrapped = true,
//   ...props
// }: LayoutProps & ComponentPropsWithoutRef<'div'>) {
//   return (
//     <div
//       className={cn(
//         'flex flex-col w-full h-full p-4 space-y-4 overflow-y-auto',
//         (title || onBack || renderHeaderElement) && 'pt-0!',
//         className
//       )}
//       {...props}
//     >
//       {(title || onBack || renderHeaderElement) && (
//         <Header
//           title={title}
//           onBack={onBack}
//           renderElement={renderHeaderElement}
//           className={headerClassName}
//         />
//       )}
//       {wrapped ? (
//         <div className={cn('space-y-4', classNameWrapper)}>{children}</div>
//       ) : (
//         children
//       )}
//     </div>
//   );
// }
