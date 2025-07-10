// src/lib/smart-toast.ts - Fixed TypeScript errors
import { toast } from 'sonner';

interface ToastOptions {
  id?: string;
  duration?: number;
  description?: string;
  action?: any;
  dismissible?: boolean;
}

const recentToasts = new Set<string>();
const timeouts = new Map<string, NodeJS.Timeout>();

const createToastKey = (message: string, type: string): string => {
  return `${type}:${message}`;
};

const clearToastKey = (key: string, delay: number = 2000): void => {
  const existingTimeout = timeouts.get(key);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  const timeout = setTimeout(() => {
    recentToasts.delete(key);
    timeouts.delete(key);
  }, delay);
  
  timeouts.set(key, timeout);
};

export const smartToast = {
  success: (message: string, options?: ToastOptions) => {
    const key = createToastKey(message, 'success');
    if (recentToasts.has(key)) {
      console.log('🚫 Prevented duplicate success toast:', message);
      return;
    }
    recentToasts.add(key);
    clearToastKey(key, options?.duration || 5000);
    return toast.success(message, options);
  },

  error: (message: string, options?: ToastOptions) => {
    const key = createToastKey(message, 'error');
    if (recentToasts.has(key)) {
      console.log('🚫 Prevented duplicate error toast:', message);
      return;
    }
    recentToasts.add(key);
    clearToastKey(key, options?.duration || 5000);
    return toast.error(message, options);
  },

  info: (message: string, options?: ToastOptions) => {
    const key = createToastKey(message, 'info');
    if (recentToasts.has(key)) {
      console.log('🚫 Prevented duplicate info toast:', message);
      return;
    }
    recentToasts.add(key);
    clearToastKey(key, options?.duration || 3000);
    return toast.info(message, options);
  },

  loading: (message: string, options?: ToastOptions) => {
    // Allow loading toasts (they update with same ID)
    return toast.loading(message, options);
  },

  dismiss: (toastId?: string | number) => {
    return toast.dismiss(toastId);
  }
};