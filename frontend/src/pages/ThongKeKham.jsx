import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import apiClient from '../services/api'
import '../styles/dashboard.css'

export default function ThongKeKham() {
  const { user } = useContext(AuthContext)
  const [thoikeshowing, setThoiKeShowing] = useState({
    tonglichkham: 0,
    hoantatlichkham: 0,
    tongbenhnhan: 0,
    xephangtrungbinh: 0,
  })
  const [dangta, setDangTa] = useState(true)
  const [loi, setLoi] = useState('')

  useEffect(() => {
    layThoiKe()
  }, [user])

  const layThoiKe = async () => {
    try {
      setDangTa(true)
      const [lichkhamRes] = await Promise.all([
        apiClient.get('/lichkham', { params: { doctor: user?.NguoiDungId } }),
      ])

      const lichkhams = lichkhamRes.data.data || []
      const benhnhanrieng = new Set(
        lichkhams.map(a => a.BenhNhanId)
      ).size

      const hoantal = lichkhams.filter(
        a => a.TrangThai === 'DaKham'
      ).length

      setThoiKeShowing({
        tonglichkham: lichkhams.length,
        hoantatlichkham: hoantal,
        tongbenhnhan: benhnhanrieng,
        xephangtrungbinh: 4.5,
      })
      setLoi('')
    } catch (err) {
      setLoi('Không thể tải thống kê')
      console.error(err)
    } finally {
      setDangTa(false)
    }
  }

  if (dangta) return <div className="loading">Đang tải...</div>

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Thống Kê Khám Bệnh</h1>
        <p>Hiệu suất công việc của Bác sĩ {user?.HoTen}</p>
      </div>

      {loi && <div className="alert alert-danger">{loi}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#007bff' }}>
          </div>
          <div className="stat-content">
            <div className="stat-value">{thoikeshowing.tonglichkham}</div>
            <div className="stat-label">Tổng Lịch Khám</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#28a745' }}>
          </div>
          <div className="stat-content">
            <div className="stat-value">{thoikeshowing.hoantatlichkham}</div>
            <div className="stat-label">Khám Hoàn Tất</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#17a2b8' }}>
          </div>
          <div className="stat-content">
            <div className="stat-value">{thoikeshowing.tongbenhnhan}</div>
            <div className="stat-label">Bệnh Nhân Riêng</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ffc107' }}>
            ⭐
          </div>
          <div className="stat-content">
            <div className="stat-value">{thoikeshowing.xephangtrungbinh.toFixed(1)}</div>
            <div className="stat-label">Xếp Hạng Trung Bình</div>
          </div>
        </div>
      </div>

      <div className="info-section" style={{ marginTop: '40px' }}>
        <div className="card">
          <div className="card-header">
            <h2>Hướng Dẫn Nhanh</h2>
          </div>
          <div style={{ padding: '20px' }}>
            <ul>
              <li>Xem <strong>Lịch Khám Hôm Nay</strong> để theo dõi bệnh nhân cần khám</li>
              <li>Quản lý <strong>Đơn Thuốc</strong> cho các bệnh nhân</li>
              <li>Theo dõi thống kê hiệu suất công việc</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
