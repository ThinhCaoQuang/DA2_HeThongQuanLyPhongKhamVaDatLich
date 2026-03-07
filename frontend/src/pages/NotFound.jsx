import { Link } from 'react-router-dom'
import '../styles/error.css'

export default function NotFound() {
  return (
    <div className="error-container">
      <div className="error-content">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Trang Không Tìm Thấy</h2>
        <p className="error-message">
          Trang bạn tìm kiếm không tồn tại hoặc bạn không có quyền truy cập.
        </p>
        <Link to="/dashboard" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
          Quay Lại Bảng Điều Khiển
        </Link>
      </div>
    </div>
  )
}
