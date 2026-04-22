import { createContext, useContext, useEffect, useState } from 'react'
import API from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyUser = async () => {
      try {
        // ⚠️ CRITICAL FIX:
        // validateStatus tells Axios: "Treat 401, 404, etc. as SUCCESSFUL responses."
        // This prevents Axios from throwing an error and logging red text to the console.
        const res = await API.get('/auth/me', {
          validateStatus: (status) => status < 500
        })
        
        // Handle Backend Casing (Success vs success)
        const isSuccess = res.data?.Success || res.data?.success;

        if (isSuccess && res.data.user) {
          setUser(res.data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        // This block will now only run for severe network errors (e.g., server down)
        // It will NOT run for 404 or 401 anymore.
        console.error("Network Error:", error)
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
    } catch (err) {
        // Ignore logout errors
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