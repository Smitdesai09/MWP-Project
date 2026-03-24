import { createContext, useContext, useEffect, useState } from 'react'
import API from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await API.get('/auth/me')
        
        // 🔥 CRITICAL FIX: Handle Backend Casing (Success vs success)
        // Your backend returns "Success", so we must check that first.
        const isSuccess = res.data?.Success || res.data?.success;

        if (isSuccess && res.data.user) {
          setUser(res.data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        // If 401 or network error, clear user
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    verifyUser()
  }, [])

  const login = (userData) => {
    setUser(userData)
  }

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
      isAuthenticated: !!user, // True if user is NOT null
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