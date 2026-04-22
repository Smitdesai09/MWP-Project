import { Routes, Route, Navigate } from 'react-router-dom'
import Home               from './pages/authPages/Home.jsx'
import Login              from './pages/authPages/Login.jsx'
import Register           from './pages/authPages/Register.jsx'
import ForgotPassword     from './pages/authPages/ForgotPassword.jsx'
import ResetPassword      from './pages/authPages/ResetPassword.jsx'
import AppToaster         from './components/AppToaster.jsx'
import NotFound           from './pages/authPages/NotFound.jsx'
import AdvisorDashboard   from './pages/advisorPages/AdvisorDashboard.jsx'
import ClientDashboard    from './pages/clientPages/ClientDashboard.jsx'
import ProtectedRoute     from './pages/authPages/ProtectedRoute.jsx'
import CreateProfile      from './pages/clientPages/CreateProfile.jsx'
import { useProfile }     from './context/ProfileContext.jsx'
import { useAuth } from './context/AuthContext.jsx'
import CalculatorsList from './components/CalculatorsList.jsx'
import CalculatorView from './components/CalculatorView.jsx'  

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

  if (authLoading || profileLoading) return <GlobalLoader />

  return (
    <>
      <AppToaster />
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<Home />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        {/* Public Standalone Calculators (Wrapped for Public UI) */}
        <Route path="/calculators" element={
           <div className="min-h-screen bg-[#fafaf8] pt-24 pb-20"> 
            <div className="max-w-7xl mx-auto px-4 sm:px-8">
              <CalculatorsList />
          </div>
        </div>
         } />
        
        <Route path="/calculators/:slug" element={
          <div className="min-h-screen bg-[#fafaf8] pt-32 px-4 sm:px-8 pb-20">
            <div className="max-w-7xl mx-auto">
              <CalculatorView />
            </div>
          </div>
        } />

        {/* Auth Routes */}
        <Route path="/login" element={<ProtectedRoute isPublic><Login /></ProtectedRoute>} />
        <Route path="/register" element={<ProtectedRoute isPublic><Register /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<ProtectedRoute isPublic><ForgotPassword /></ProtectedRoute>} />

        {/* --- Protected Routes --- */}
        <Route path="/create-profile" element={
          <ProtectedRoute allowedRoles={['client']}>
            <CreateProfile />
          </ProtectedRoute>
        } />

        {/* Client Dashboard (Handles its own internal sub-routes) */}
        <Route path="/client/*" element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientDashboard />
          </ProtectedRoute>
        } />

        <Route path="/advisor/*" element={
          <ProtectedRoute allowedRoles={['advisor']}>
            <AdvisorDashboard />
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}