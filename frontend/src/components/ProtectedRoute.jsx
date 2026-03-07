import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function ProtectedRoute({ children, requiredRoles = [] }) {
  const { isAuthenticated, user, isLoading } = useContext(AuthContext)

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.VaiTro || user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
