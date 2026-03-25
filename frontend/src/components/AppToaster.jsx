import { Toaster } from 'react-hot-toast'

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      // ✅ FIX: Force toaster to render above modals (z-index > 9999)
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
          // Specific overrides for success
          style: {
            background: '#111827',
            color: '#fff',
          },
        },
        error: {
          duration: 4000,
          // Specific overrides for error
          style: {
            background: '#fff',
            color: '#dc2626',
            border: '1px solid #fecaca',
          },
        },
      }}
    />
  )
}