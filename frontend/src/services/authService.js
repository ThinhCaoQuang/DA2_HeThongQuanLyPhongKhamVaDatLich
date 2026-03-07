import apiClient from './api'

const authService = {
  login: async (username, password) => {
    const response = await apiClient.post('/auth/login', { username, password })
    console.log('Login response:', response.data)
    
    if (response.data.success && response.data.data) {
      const { token, user } = response.data.data
      console.log('User data:', user)
      
      // Normalize user data - convert VaiTro to role for consistent naming
      if (user && user.VaiTro) {
        user.role = user.VaiTro
      }
      
      if (token) {
        localStorage.setItem('token', token)
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      }
      
      return response.data.data
    }
    return response.data.data
  },

  register: async (username, password, email) => {
    const response = await apiClient.post('/auth/register', { 
      username, 
      password, 
      email 
    })
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    if (user) {
      const parsed = JSON.parse(user)
      // Normalize: convert VaiTro to role if it exists
      if (parsed.VaiTro && !parsed.role) {
        parsed.role = parsed.VaiTro
      }
      return parsed
    }
    return null
  },

  getToken: () => {
    return localStorage.getItem('token')
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  },
}

export default authService
