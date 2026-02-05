import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../styles/Layout.css';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Bệnh Nhân', icon: '👥' },
    { path: '/bacsi', label: 'Bác Sĩ', icon: '👨‍⚕️' },
    { path: '/chuyenkhoa', label: 'Chuyên Khoa', icon: '🏥' },
    { path: '/lichkham', label: 'Lịch Khám', icon: '📅' },
  ];

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>🏥 Phòng Khám</h2>
          <button 
            className="toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <span className="user-icon">👤</span>
            {sidebarOpen && (
              <div className="user-info">
                <p className="user-name">{user.HoTen}</p>
                <p className="user-role">{user.VaiTro}</p>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span>
            {sidebarOpen && <span>Đăng Xuất</span>}
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
