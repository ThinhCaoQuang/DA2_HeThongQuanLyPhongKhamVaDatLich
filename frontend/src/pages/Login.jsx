import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import '../styles/login.css'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(username, password)
      if (result?.user) {
        navigate('/dashboard')
      } else {
        setError('Đăng nhập thất bại')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi kết nối đến server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Hệ Thống Quản Lý Phòng Khám</h1>
          <p>Đăng Nhập</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Tên Đăng Nhập</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật Khẩu</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary login-btn"
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="login-footer">
          <p>Tài khoản demo:</p>
          <p>Nhân viên tiếp tân: letan / 123</p>
          <p>Bác sĩ: bacsitest / 123</p>
          <p>Quản trị viên: admin1 / 123</p>
        </div>
      </div>
    </div>
  )
}
