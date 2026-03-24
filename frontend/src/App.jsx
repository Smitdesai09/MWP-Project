import { Routes, Route,Navigate } from 'react-router-dom'
import Home              from './pages/authPages/Home.jsx'
import Login             from './pages/authPages/Login.jsx'
import Register          from './pages/authPages/Register.jsx'
import ForgotPassword    from './pages/authPages/ForgotPassword.jsx'
import ResetPassword     from './pages/authPages/ResetPassword.jsx'
import AppToaster        from './components/AppToaster.jsx'
import NotFound          from './pages/authPages/NotFound.jsx'
import AdvisorDashboard  from './pages/advisorPages/AdvisorDashboard.jsx'
import ClientDashboard   from './pages/clientPages/ClientDashboard.jsx'
import ProtectedRoute from './pages/authPages/ProtectedRoute.jsx'
import { useProfile } from './context/ProfileContext.jsx'
import CreateProfile from './pages/clientPages/CreateProfile.jsx'



export default function App() {

  const { profileExists, loading } = useProfile()
  if (loading) return null

  return (
    <>
      <AppToaster />
      <Routes>

        {/* Public */}
        <Route path="/"                      element={<Home />} />
        <Route path="*"                      element={<NotFound />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Logged-out only */}
        <Route path="/login" element={
          <ProtectedRoute isPublic><Login /></ProtectedRoute>
        } />
        <Route path="/register" element={
          <ProtectedRoute isPublic><Register /></ProtectedRoute>
        } />
        <Route path="/forgot-password" element={
          <ProtectedRoute isPublic><ForgotPassword /></ProtectedRoute>
        } />

        {/* ── Client — PUBLIC for now (remove wrapper once backend is ready) ── */}
        {/* <Route path="/client/*" element={<ClientDashboard />} /> */}

        <Route path="/create-profile" element={<CreateProfile />} />

        <Route path="/client/*" element={
          profileExists ? <ClientDashboard /> : <Navigate to="/create-profile" replace />
        } />

        {/* TODO: swap above with this when backend is ready:
        <Route path="/client/*" element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientDashboard />
          </ProtectedRoute>
        } /> */}



        {/* Advisor */}
        <Route path="/advisor/dashboard" element={
          <ProtectedRoute allowedRoles={['advisor']}>
            <AdvisorDashboard />
          </ProtectedRoute>
        } />

      </Routes>
    </>
  )
}