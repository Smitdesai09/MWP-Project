import { createContext, useContext, useEffect, useState } from 'react'
import API from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyUser = async () => {
      try {
        // ⚠️ FIX: Added closing brace } for the config object and closing parenthesis ) for the function
        const res = await API.get('/auth/me', {
          validateStatus: function (status) {
            return status < 500 // Treat 401 and 404 as valid responses, not errors
          }
        }) 
        
        // Handle Backend Casing (Success vs success)
        const isSuccess = res.data?.Success || res.data?.success;

        if (isSuccess && res.data.user) {
          setUser(res.data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        // This now only catches real network errors (disconnect, etc.)
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