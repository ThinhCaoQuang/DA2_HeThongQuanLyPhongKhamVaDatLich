import { createContext, useState, useEffect } from 'react'
import authService from '../services/authService'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
    setIsLoading(false)
  }, [])

  const login = async (username, password) => {
    const response = await authService.login(username, password)
    console.log('AuthContext login response:', response)
    
    if (response?.user) {
      console.log('Setting user:', response.user)
      setUser(response.user)
    }
    return response
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const value = {
    user,
    setUser,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
