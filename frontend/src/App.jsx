import { Routes, Route } from 'react-router-dom'
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
export default function App() {
  return (
    <>
      <AppToaster />
      <Routes>

        {/* Anyone can visit */}
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />

        {/* reset-password — token in URL is the security */}
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* isPublic — logged out only */}
        <Route path="/login" element={
          <ProtectedRoute isPublic>
            <Login />
          </ProtectedRoute>
        } />

        <Route path="/register" element={
          <ProtectedRoute isPublic>
            <Register />
          </ProtectedRoute>
        } />

        <Route path="/forgot-password" element={
          <ProtectedRoute isPublic>
            <ForgotPassword />
          </ProtectedRoute>
        } />

        {/* Protected — logged in + correct role only */}
        <Route path="/client/dashboard" element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientDashboard />
          </ProtectedRoute>
        } />

        <Route path="/advisor/dashboard" element={
          <ProtectedRoute allowedRoles={['advisor']}>
            <AdvisorDashboard />
          </ProtectedRoute>
        } />

      </Routes>
    </>
  )
} 

