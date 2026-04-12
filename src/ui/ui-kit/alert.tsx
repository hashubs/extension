import { cn } from '@/ui/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  IoAlertCircle,
  IoCheckmarkCircle,
  IoInformationCircle,
} from 'react-icons/io5';
import { TbAlertTriangleFilled } from 'react-icons/tb';

import React from 'react';

export const alertVariants = cva(
  'border rounded-xl p-3 backdrop-blur-sm bg-gradient-to-br',
  {
    variants: {
      variant: {
        danger: '',
        warning: '',
        success: '',
        info: '',
        neutral: '',
      },
      theme: {
        light: '',
        dark: '',
        system: '',
      },
    },
    compoundVariants: [
      {
        variant: 'danger',
        theme: 'system',
        className:
          'from-destructive/10 to-red-700/10 border-destructive/30 dark:border-destructive/20',
      },
      {
        variant: 'danger',
        theme: 'light',
        className: 'from-destructive/10 to-red-700/10 border-destructive/30',
      },
      {
        variant: 'danger',
        theme: 'dark',
        className: 'from-destructive/10 to-red-700/10 border-destructive/20',
      },

      {
        variant: 'warning',
        theme: 'system',
        className:
          'from-yellow-500/10 to-yellow-700/10 border-yellow-500/30 dark:border-yellow-500/20',
      },
      {
        variant: 'warning',
        theme: 'light',
        className: 'from-yellow-500/10 to-yellow-700/10 border-yellow-500/30',
      },
      {
        variant: 'warning',
        theme: 'dark',
        className: 'from-yellow-500/10 to-yellow-700/10 border-yellow-500/20',
      },

      {
        variant: 'success',
        theme: 'system',
        className:
          'from-teal-500/10 to-teal-700/10 border-teal-500/30 dark:border-teal-500/20',
      },
      {
        variant: 'success',
        theme: 'light',
        className: 'from-teal-500/10 to-teal-700/10 border-teal-500/30',
      },
      {
        variant: 'success',
        theme: 'dark',
        className: 'from-teal-500/10 to-teal-700/10 border-teal-500/20',
      },

      {
        variant: 'info',
        theme: 'system',
        className:
          'from-blue-500/10 to-blue-700/10 border-blue-500/30 dark:border-blue-500/20',
      },
      {
        variant: 'info',
        theme: 'light',
        className: 'from-blue-500/10 to-blue-700/10 border-blue-500/30',
      },
      {
        variant: 'info',
        theme: 'dark',
        className: 'from-blue-500/10 to-blue-700/10 border-blue-500/20',
      },

      {
        variant: 'neutral',
        theme: 'system',
        className:
          'from-slate-100/50 to-slate-200/30 border-slate-300/30 dark:from-slate-900/50 dark:to-slate-800/30 dark:border-slate-700/30',
      },
      {
        variant: 'neutral',
        theme: 'light',
        className: 'from-slate-100/50 to-slate-200/30 border-slate-300/30',
      },
      {
        variant: 'neutral',
        theme: 'dark',
        className: 'from-slate-900/50 to-slate-800/30 border-slate-700/30',
      },
    ],
    defaultVariants: {
      variant: 'info',
      theme: 'system',
    },
  }
);

export const iconBgVariants = cva(
  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
  {
    variants: {
      variant: {
        danger: '',
        warning: '',
        success: '',
        info: '',
        neutral: '',
      },
      theme: {
        light: '',
        dark: '',
        system: '',
      },
    },
    compoundVariants: [
      {
        variant: 'danger',
        theme: 'system',
        className: 'bg-destructive/20 dark:bg-destructive/20',
      },
      { variant: 'danger', theme: 'light', className: 'bg-destructive/20' },
      { variant: 'danger', theme: 'dark', className: 'bg-destructive/20' },
      {
        variant: 'warning',
        theme: 'system',
        className: 'bg-yellow-500/20 dark:bg-yellow-500/20',
      },
      { variant: 'warning', theme: 'light', className: 'bg-yellow-500/20' },
      { variant: 'warning', theme: 'dark', className: 'bg-yellow-500/20' },
      {
        variant: 'success',
        theme: 'system',
        className: 'bg-teal-500/20 dark:bg-teal-500/20',
      },
      { variant: 'success', theme: 'light', className: 'bg-teal-500/20' },
      { variant: 'success', theme: 'dark', className: 'bg-teal-500/20' },
      {
        variant: 'info',
        theme: 'system',
        className: 'bg-blue-500/20 dark:bg-blue-500/20',
      },
      { variant: 'info', theme: 'light', className: 'bg-blue-500/20' },
      { variant: 'info', theme: 'dark', className: 'bg-blue-500/20' },
      {
        variant: 'neutral',
        theme: 'system',
        className: 'bg-slate-500/10 dark:bg-blue-500/10',
      },
      { variant: 'neutral', theme: 'light', className: 'bg-slate-500/10' },
      { variant: 'neutral', theme: 'dark', className: 'bg-blue-500/10' },
    ],
    defaultVariants: {
      variant: 'info',
      theme: 'system',
    },
  }
);

export const iconColorVariants = cva('w-4 h-4', {
  variants: {
    variant: {
      danger: '',
      warning: '',
      success: '',
      info: '',
      neutral: '',
    },
    theme: {
      light: '',
      dark: '',
      system: '',
    },
  },
  compoundVariants: [
    {
      variant: 'danger',
      theme: 'system',
      className: 'text-red-600 dark:text-red-400',
    },
    { variant: 'danger', theme: 'light', className: 'text-red-600' },
    { variant: 'danger', theme: 'dark', className: 'text-red-400' },
    {
      variant: 'warning',
      theme: 'system',
      className: 'text-yellow-600 dark:text-yellow-400',
    },
    { variant: 'warning', theme: 'light', className: 'text-yellow-600' },
    { variant: 'warning', theme: 'dark', className: 'text-yellow-400' },
    {
      variant: 'success',
      theme: 'system',
      className: 'text-teal-600 dark:text-teal-400',
    },
    { variant: 'success', theme: 'light', className: 'text-teal-600' },
    { variant: 'success', theme: 'dark', className: 'text-teal-400' },
    {
      variant: 'info',
      theme: 'system',
      className: 'text-blue-600 dark:text-blue-400',
    },
    { variant: 'info', theme: 'light', className: 'text-blue-600' },
    { variant: 'info', theme: 'dark', className: 'text-blue-400' },
    {
      variant: 'neutral',
      theme: 'system',
      className: 'text-slate-600 dark:text-blue-400',
    },
    { variant: 'neutral', theme: 'light', className: 'text-slate-600' },
    { variant: 'neutral', theme: 'dark', className: 'text-blue-400' },
  ],
  defaultVariants: {
    variant: 'info',
    theme: 'system',
  },
});

export const titleVariants = cva('text-sm font-semibold', {
  variants: {
    variant: {
      danger: '',
      warning: '',
      success: '',
      info: '',
      neutral: '',
    },
    theme: {
      light: '',
      dark: '',
      system: '',
    },
  },
  compoundVariants: [
    {
      variant: 'danger',
      theme: 'system',
      className: 'text-red-900 dark:text-red-200',
    },
    { variant: 'danger', theme: 'light', className: 'text-red-900' },
    { variant: 'danger', theme: 'dark', className: 'text-red-200' },
    {
      variant: 'warning',
      theme: 'system',
      className: 'text-yellow-900 dark:text-yellow-200',
    },
    { variant: 'warning', theme: 'light', className: 'text-yellow-900' },
    { variant: 'warning', theme: 'dark', className: 'text-yellow-200' },
    {
      variant: 'success',
      theme: 'system',
      className: 'text-teal-900 dark:text-teal-200',
    },
    { variant: 'success', theme: 'light', className: 'text-teal-900' },
    { variant: 'success', theme: 'dark', className: 'text-teal-200' },
    {
      variant: 'info',
      theme: 'system',
      className: 'text-blue-900 dark:text-blue-200',
    },
    { variant: 'info', theme: 'light', className: 'text-blue-900' },
    { variant: 'info', theme: 'dark', className: 'text-blue-200' },
    {
      variant: 'neutral',
      theme: 'system',
      className: 'text-slate-900 dark:text-slate-200',
    },
    { variant: 'neutral', theme: 'light', className: 'text-slate-900' },
    { variant: 'neutral', theme: 'dark', className: 'text-slate-200' },
  ],
  defaultVariants: {
    variant: 'info',
    theme: 'system',
  },
});

export const descriptionVariants = cva('text-sm leading-relaxed', {
  variants: {
    variant: {
      danger: '',
      warning: '',
      success: '',
      info: '',
      neutral: '',
    },
    theme: {
      light: '',
      dark: '',
      system: '',
    },
  },
  compoundVariants: [
    {
      variant: 'danger',
      theme: 'system',
      className: 'text-red-800/80 dark:text-red-300/80',
    },
    { variant: 'danger', theme: 'light', className: 'text-red-800/80' },
    { variant: 'danger', theme: 'dark', className: 'text-red-300/80' },
    {
      variant: 'warning',
      theme: 'system',
      className: 'text-yellow-800/80 dark:text-yellow-300/80',
    },
    { variant: 'warning', theme: 'light', className: 'text-yellow-800/80' },
    { variant: 'warning', theme: 'dark', className: 'text-yellow-300/80' },
    {
      variant: 'success',
      theme: 'system',
      className: 'text-teal-800/80 dark:text-teal-300/80',
    },
    { variant: 'success', theme: 'light', className: 'text-teal-800/80' },
    { variant: 'success', theme: 'dark', className: 'text-teal-300/80' },
    {
      variant: 'info',
      theme: 'system',
      className: 'text-blue-800/80 dark:text-blue-300/80',
    },
    { variant: 'info', theme: 'light', className: 'text-blue-800/80' },
    { variant: 'info', theme: 'dark', className: 'text-blue-300/80' },
    {
      variant: 'neutral',
      theme: 'system',
      className: 'text-slate-600 dark:text-slate-400',
    },
    { variant: 'neutral', theme: 'light', className: 'text-slate-600' },
    { variant: 'neutral', theme: 'dark', className: 'text-slate-400' },
  ],
  defaultVariants: {
    variant: 'info',
    theme: 'system',
  },
});

const alertIcons = {
  danger: IoAlertCircle,
  warning: TbAlertTriangleFilled,
  success: IoCheckmarkCircle,
  info: IoInformationCircle,
  neutral: IoInformationCircle,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title: string;
  description?: string;
  items?: string[];
  forceTheme?: 'light' | 'dark';
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant = 'info',
      forceTheme,
      title,
      description,
      items,
      className,
      ...props
    },
    ref
  ) => {
    const Icon = alertIcons[variant || 'info'];
    const theme = forceTheme || 'system';

    return (
      <div
        ref={ref}
        className={cn(alertVariants({ variant, theme }), className)}
        {...props}
      >
        <div className="flex items-start gap-3">
          <div className={cn(iconBgVariants({ variant, theme }))}>
            <Icon className={cn(iconColorVariants({ variant, theme }))} />
          </div>
          <div className="flex-1">
            <h4
              className={cn(
                titleVariants({ variant, theme }),
                items ? 'mb-1.5' : 'mb-1'
              )}
            >
              {title}
            </h4>

            {description && (
              <p className={cn(descriptionVariants({ variant, theme }))}>
                {description}
              </p>
            )}

            {items && items.length > 0 && (
              <ul
                className={cn(
                  descriptionVariants({ variant, theme }),
                  'space-y-1.5'
                )}
              >
                {items.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span
                      className={cn(
                        'w-1 h-1 rounded-full',
                        variant === 'neutral'
                          ? 'bg-slate-600'
                          : 'bg-current opacity-50'
                      )}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';
