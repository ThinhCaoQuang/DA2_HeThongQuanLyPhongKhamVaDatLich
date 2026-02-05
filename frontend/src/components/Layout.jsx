import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../styles/Layout.css';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Bệnh Nhân' },
    { path: '/bacsi', label: 'Bác Sĩ' },
    { path: '/chuyenkhoa', label: 'Chuyên Khoa' },
    { path: '/lichkham', label: 'Lịch Khám' },
  ];

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Phòng Khám</h2>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-info">
              <p className="user-name">{user.HoTen}</p>
              <p className="user-role">{user.VaiTro}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span>Đăng Xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
