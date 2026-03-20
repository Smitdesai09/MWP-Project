import { createContext, useContext, useEffect, useState } from 'react'
import API from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // Runs once on app load
  // Calls /auth/me to verify cookie with backend
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await API.get('/auth/me')
        setUser(res.data.user)
        // res.data.user = { id, name, email, role }
      } catch {
        // Cookie missing, expired, or invalid
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    verifyUser()
  }, [])

  // Call after successful login
  // userData comes from login API response
  const login = (userData) => {
    setUser(userData)
  }

  // Call on logout button click
  const logout = async () => {
    try {
      await API.post('/auth/logout')
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}