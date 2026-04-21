import { create } from 'zustand';

interface ToastOptions {
  duration?: number;
  showClose?: boolean;
  variant?: 'success' | 'error' | 'default';
}

interface ToastState {
  message: string | null;
  visible: boolean;
  showClose: boolean;
  variant: 'success' | 'error' | 'default';
  show: (message: string, options?: ToastOptions) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => {
  let timer: NodeJS.Timeout | null = null;

  return {
    message: null,
    visible: false,
    showClose: true,
    variant: 'default',
    show: (message, options = {}) => {
      // Clear existing timer if any
      if (timer) clearTimeout(timer);

      set({
        message,
        visible: true,
        showClose: options.showClose ?? true,
        variant: options.variant ?? 'default',
      });

      // Auto hide after duration (default 3s)
      timer = setTimeout(() => {
        set({ visible: false });
      }, options.duration ?? 3000);
    },
    hide: () => {
      if (timer) clearTimeout(timer);
      set({ visible: false });
    },
  };
});

export const toast = {
  show: (message: string, options?: ToastOptions) =>
    useToastStore.getState().show(message, options),
  hide: () => useToastStore.getState().hide(),
};
