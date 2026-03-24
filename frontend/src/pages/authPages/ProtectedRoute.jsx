import { Navigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { useProfile } from '../../context/ProfileContext' // 1. Import Profile Context

// ── Loading Spinner ──────────────────────────────────
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf8]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Securing your session...</p>
      </div>
    </div>
  )
}

// ── Redirect helper ──────
function getDashboardPath(role) {
  switch (role) {
    case 'client':  return '/client/dashboard'
    case 'advisor': return '/advisor/dashboard'
    default:        return '/login'
  }
}

export default function ProtectedRoute({ children, allowedRoles, isPublic = false }) {
  const { user, loading, isAuthenticated } = useAuth()
  const { profileExists, loading: profileLoading } = useProfile() // 2. Get Profile State
  const location = useLocation()

  // 3. Wait for BOTH Auth and Profile checks to finish
  if (loading || profileLoading) return <LoadingSpinner />

  // ── 1. PUBLIC ROUTE LOGIC (Login/Register Pages) ───────────
  if (isPublic) {
    // If user is logged in
    if (isAuthenticated) {
      // If Client has no profile, force them to create it (even if they visit /login)
      if (user?.role === 'client' && !profileExists) {
        return <Navigate to="/create-profile" replace />
      }
      // Otherwise send to their dashboard
      return <Navigate to={getDashboardPath(user.role)} replace />
    }
    // Not logged in? Show the public page (Login/Register)
    return children
  }

  // ── 2. PROTECTED ROUTE LOGIC (Dashboard/Create Profile) ────────

  // A. Not logged in? Go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // B. Check Roles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    toast.error("You don't have access to that page")
    return <Navigate to={getDashboardPath(user.role)} replace />
  }

  // C. SPECIAL LOGIC: Client Profile Enforcement
  if (user.role === 'client') {
    const isCreateProfilePage = location.pathname === '/create-profile'

    // If NO profile exists
    if (!profileExists) {
      // If they are trying to access ANYTHING other than create-profile, stop them
      if (!isCreateProfilePage) {
        return <Navigate to="/create-profile" replace />
      }
    } 
    // If profile EXISTS
    else {
      // If they try to access /create-profile manually, send them to dashboard
      if (isCreateProfilePage) {
        return <Navigate to="/client/dashboard" replace />
      }
    }
  }

  // ✅ Authorized & Profile OK
  return children
}