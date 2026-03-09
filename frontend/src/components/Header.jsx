import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { getRoleDisplayName } from '../utils/roleHelper'
// import apiClient from '../services/api'
import '../styles/layout.css'

export default function Header() {
  const navigate = useNavigate()
  const { user, logout } = useContext(AuthContext)
  // const [unreadCount, setUnreadCount] = useState(0)

  // useEffect(() => {
  //   if (user) {
  //     layUnreadCount()
  //     // Refresh every 30 seconds
  //     const interval = setInterval(layUnreadCount, 30000)
  //     return () => clearInterval(interval)
  //   }
  // }, [user])

  // const layUnreadCount = async () => {
  //   try {
  //     const response = await apiClient.get('/thongbao/count/unread')
  //     setUnreadCount(response.data.data?.unreadCount || 0)
  //   } catch (err) {
  //     console.log('Could not fetch notification count')
  //   }
  // }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // const handleNotificationClick = () => {
  //   navigate('/notifications')
  // }

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="header-title">Quản Lý Phòng Khám</h1>
        </div>
        <div className="header-right">
          {/* Notification bell disabled */}
          {/* <button
            className="btn-notification"
            onClick={handleNotificationClick}
            style={{
              position: 'relative',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '1.2em',
              cursor: 'pointer',
              marginRight: '20px',
              color: '#333'
            }}
            title="Thông báo"
          >
            [Bell]
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75em',
                  fontWeight: 'bold'
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button> */}
          <div className="user-info">
            <span className="user-name">{user?.HoTen || user?.TenDangNhap || user?.username}</span>
            <span className="user-role">({getRoleDisplayName(user?.VaiTro || user?.role)})</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Đăng Xuất
          </button>
        </div>
      </div>
    </header>
  )
}
