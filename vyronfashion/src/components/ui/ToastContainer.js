'use client';

import { useState, useEffect } from 'react';
import { Toast, ToastContainer as ToastContainerComponent } from '@/components/account/ui/Toast';

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleShowToast = (event) => {
      const { message, type, duration } = event.detail;
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    };

    window.addEventListener('showToast', handleShowToast);
    return () => {
      window.removeEventListener('showToast', handleShowToast);
    };
  }, []);

  const handleRemove = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[10000] space-y-2">
      {toasts.map((toast) => (
        <div key={toast.id}>
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => handleRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}

