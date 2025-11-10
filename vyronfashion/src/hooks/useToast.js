'use client';

import { useState, useCallback } from 'react';

let toastId = 0;
const listeners = new Set();

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = ++toastId;
    const newToast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, newToast]);
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message, duration) => {
    return showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message, duration) => {
    return showToast(message, 'error', duration);
  }, [showToast]);

  const warning = useCallback((message, duration) => {
    return showToast(message, 'warning', duration);
  }, [showToast]);

  const info = useCallback((message, duration) => {
    return showToast(message, 'info', duration);
  }, [showToast]);

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}

// Global toast function để dùng ở bất kỳ đâu
export const toast = {
  success: (message, duration = 3000) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message, type: 'success', duration } 
      }));
    }
  },
  error: (message, duration = 3000) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message, type: 'error', duration } 
      }));
    }
  },
  warning: (message, duration = 3000) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message, type: 'warning', duration } 
      }));
    }
  },
  info: (message, duration = 3000) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message, type: 'info', duration } 
      }));
    }
  },
};

