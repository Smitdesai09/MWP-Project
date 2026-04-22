import { useEffect } from 'react';
import toast, { Toaster, useToasterStore } from 'react-hot-toast';

export default function AppToaster() {
  // Access the internal state of react-hot-toast
  const { toasts } = useToasterStore();

  // Set your desired limit here
  const TOAST_LIMIT = 5;

  useEffect(() => {
    toasts
      .filter((t) => t.visible) // Only look at visible toasts
      .filter((_, i) => i >= TOAST_LIMIT) // Find any that exceed the limit
      .forEach((t) => toast.dismiss(t.id)); // Dismiss them
  }, [toasts]);

  return (
    <Toaster
      position="top-right"
      containerStyle={{
        top: 20,
        right: 20,
        zIndex: 99999 
      }}
      toastOptions={{
        // Default styles for all toasts
        style: {
          background: '#111827',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '500',
          borderRadius: '12px',
          padding: '12px 16px',
        },
        success: {
          duration: 3000,
          style: {
            background: '#111827',
            color: '#fff',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: '#fff',
            color: '#dc2626',
            border: '1px solid #fecaca',
          },
        },
        // 90% Warning style
        warning: {
          duration: 3000,
          style: {
            background: '#FFFBEB',
            color: '#92400E',
            border: '1px solid #FDE68A',
          },
          iconTheme: {
            primary: '#F59E0B',
            secondary: '#FFFBEB',
          }
        },
        // 100% Budget Limit Exceeded style
        budgetLimit: {
          duration: 4000,
          style: {
            background: '#FEF2F2',
            color: '#991B1B',
            border: '1px solid #FECACA',
          },
          iconTheme: {
            primary: '#EF4444',
            secondary: '#FEF2F2',
          }
        }
      }}
    />
  );
}