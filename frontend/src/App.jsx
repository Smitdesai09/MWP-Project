import { Routes, Route, Navigate } from 'react-router-dom'
import Home              from './pages/authPages/Home.jsx'
import Login             from './pages/authPages/Login.jsx'
import Register          from './pages/authPages/Register.jsx'
import ForgotPassword    from './pages/authPages/ForgotPassword.jsx'
import ResetPassword     from './pages/authPages/ResetPassword.jsx'
import AppToaster        from './components/AppToaster.jsx'
import NotFound          from './pages/authPages/NotFound.jsx'
import AdvisorDashboard  from './pages/advisorPages/AdvisorDashboard.jsx'
import ClientDashboard   from './pages/clientPages/ClientDashboard.jsx'
import ProtectedRoute    from './pages/authPages/ProtectedRoute.jsx'
import CreateProfile     from './pages/clientPages/CreateProfile.jsx'
import { useProfile }    from './context/ProfileContext.jsx'
import { useAuth }       from './context/AuthContext.jsx'

// Simple Global Loader
const GlobalLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#fafaf8]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500">Initializing...</p>
    </div>
  </div>
)

export default function App() {
  const { loading: authLoading }      = useAuth()
  const { loading: profileLoading }  = useProfile()

  // Wait for BOTH Auth and Profile to finish
  if (authLoading || profileLoading) return <GlobalLoader />

  return (
    <>
      <AppToaster />
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/"                      element={<Home />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Auth Routes (Logged-out only) */}
        <Route path="/login" element={
          <ProtectedRoute isPublic><Login /></ProtectedRoute>
        } />
        <Route path="/register" element={
          <ProtectedRoute isPublic><Register /></ProtectedRoute>
        } />
        <Route path="/forgot-password" element={
          <ProtectedRoute isPublic><ForgotPassword /></ProtectedRoute>
        } />

        {/* --- Protected Routes --- */}

        {/* 1. Create Profile (Client Only) */}
        <Route path="/create-profile" element={
          <ProtectedRoute allowedRoles={['client']}>
            <CreateProfile />
          </ProtectedRoute>
        } />

        {/* 2. Client Dashboard */}
        <Route path="/client/*" element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientDashboard />
          </ProtectedRoute>
        } />

        {/* 3. Advisor Dashboard */}
        <Route path="/advisor/*" element={
          <ProtectedRoute allowedRoles={['advisor']}>
            <AdvisorDashboard />
          </ProtectedRoute>
        } />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </>
  )
}