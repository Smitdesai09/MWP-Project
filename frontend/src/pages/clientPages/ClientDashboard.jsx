import { useNavigate } from 'react-router-dom'
import { useAuth }     from '../../context/AuthContext.jsx'
import toast           from 'react-hot-toast'

export default function ClientDashboard() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully', { position: 'top-right' })
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold text-gray-900">Client Dashboard</h1>
      <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-all"
      >
        Logout
      </button>
    </div>
  )
}