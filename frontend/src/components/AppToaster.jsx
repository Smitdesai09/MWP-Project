import { Toaster } from 'react-hot-toast'

export default function AppToaster() {
  return (
    <Toaster
      limit={3}
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
        // ✅ ADD THIS: 90% Warning style
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
        // ✅ ADD THIS: 100% Budget Limit Exceeded style
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
  )
}