import { Toaster } from 'react-hot-toast'

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        success: {
          duration: 3000,
          style: {
            background: '#111827',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '500',
            borderRadius: '12px',
            padding: '12px 16px',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: '#fff',
            color: '#dc2626',
            fontSize: '14px',
            fontWeight: '500',
            borderRadius: '12px',
            border: '1px solid #fecaca',
            padding: '12px 16px',
          },
        },
      }}
    />
  )
}