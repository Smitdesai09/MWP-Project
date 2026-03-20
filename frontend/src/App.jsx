import { Routes, Route } from 'react-router-dom'
import Home from './pages/authPages/Home.jsx'
import Login from './pages/authPages/Login.jsx'
import Register from './pages/authPages/Register.jsx'
import ForgotPassword from './pages/authPages/ForgotPassword.jsx'
import ResetPassword from './pages/authPages/ResetPassword.jsx'
import AppToaster from './components/AppToaster.jsx'
import NotFound from './pages/authPages/NotFound.jsx'
import AdvisorDashboard from './pages/advisorPages/AdvisorDashboard.jsx'
import ClientDashboard from './pages/clientPages/ClientDashboard.jsx'

export default function App() {
  return (
    <>
      <AppToaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/client/dashboard" element={<ClientDashboard />} />
        <Route path="/advisor/dashboard" element={<AdvisorDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
    
  )
}
