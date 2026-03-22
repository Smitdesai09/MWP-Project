import { Navigate }  from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

// ── Loading Spinner ──────────────────────────────────
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf8]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Checking access...</p>
      </div>
    </div>
  )
}

// ── Redirect to correct dashboard based on role ──────
function getDashboardPath(role) {
  switch (role) {
    case 'client':  return '/client/dashboard'
    case 'advisor': return '/advisor/dashboard'
    // case 'admin':   return '/admin/dashboard'
    default:        return '/login'
  }
}

// ── ProtectedRoute ───────────────────────────────────
// isPublic={true}  → login, register, forgot-password
//                    logged in users get redirected to their dashboard
// isPublic={false} → dashboards, protected pages
//                    logged out users get redirected to /login
export default function ProtectedRoute({ children, allowedRoles, isPublic = false }) {
  const { user, loading, isAuthenticated } = useAuth()

  // ⏳ Wait for /auth/me to finish
  if (loading) return <LoadingSpinner />

  // ── Public route logic ───────────────────────────
  if (isPublic) {
    // Already logged in → send to their dashboard
    if (isAuthenticated) {
      return <Navigate to={getDashboardPath(user.role)} replace />
    }
    // Not logged in → show the page
    return children
  }

  // ── Protected route logic ────────────────────────

  // Not logged in → send to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Wrong role → toast + redirect to their own dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    toast.error("You don't have access to that page", {
      duration: 2000,
      position: 'top-right'
    })
    return <Navigate to={getDashboardPath(user.role)} replace />
  }

  // ✅ Logged in + correct role → show the page
  return children
}