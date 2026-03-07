import { useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import '../styles/layout.css'

export default function Sidebar() {
  const { user } = useContext(AuthContext)
  const location = useLocation()

  const isActive = (path) => location.pathname === path ? 'active' : ''

  const getMenuItems = () => {
    const commonItems = [
      { path: '/dashboard', label: 'Bảng Điều Khiển' },
    ]

    const userRole = user?.VaiTro || user?.role

    if (userRole === 'LeTan') {
      return [
        ...commonItems,
        { path: '/quick-stats', label: 'Thống Kê Nhanh' },
        { path: '/today-appointments', label: 'Lịch Khám Hôm Nay' },
        { path: '/schedule-coordination', label: 'Điều Phối Lịch' },
        { path: '/patients', label: 'Bệnh Nhân' },
        { path: '/appointments', label: 'Lịch Khám' },
        { path: '/doctors', label: 'Danh Sách Bác Sĩ' },
        { path: '/specialties', label: 'Chuyên Khoa' },
        { path: '/schedules', label: 'Lịch Làm Việc' },
        { path: '/medical-records', label: 'Hồ Sơ Khám Bệnh' },
        { path: '/prescriptions', label: 'Đơn Thuốc' },
      ]
    } else if (userRole === 'BacSi') {
      return [
        ...commonItems,
        { path: '/doctor-stats', label: 'Thống Kê Khám' },
        { path: '/doctor-today-appointments', label: 'Khám Hôm Nay' },
        { path: '/prescriptions', label: 'Đơn Thuốc' },
        { path: '/patients', label: 'Danh Sách Bệnh Nhân' },
        { path: '/schedules', label: 'Lịch Làm Việc' },
        { path: '/my-appointments', label: 'Lịch Khám Của Tôi' },
        { path: '/medical-records', label: 'Hồ Sơ Khám Bệnh' },
      ]
    } else if (userRole === 'QuanTri') {
      return [
        ...commonItems,
        { path: '/patients', label: 'Bệnh Nhân' },
        { path: '/doctors', label: 'Bác Sĩ' },
        { path: '/specialties', label: 'Chuyên Khoa' },
        { path: '/appointments', label: 'Lịch Khám' },
        { path: '/schedules', label: 'Lịch Làm Việc' },
        { path: '/medical-records', label: 'Hồ Sơ Khám Bệnh' },
        { path: '/users', label: 'Quản Lý Người Dùng' },
      ]
    }

    return commonItems
  }

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {getMenuItems().map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${isActive(item.path)}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
