import { useState, useEffect } from 'react'
import apiClient from '../services/api'
import '../styles/dashboard.css'

export default function ThongKeNhanh() {
  const [thoikeshowing, setThoiKeshowing] = useState({
    tongbenhNhan: 0,
    tonglichKham: 0,
    homnaylichKham: 0,
    bacsicoSan: 0,
  })
  const [dangta, setDangTa] = useState(true)
  const [loi, setLoi] = useState('')

  useEffect(() => {
    layThoiKe()
  }, [])

  const layThoiKe = async () => {
    try {
      setDangTa(true)
      const today = new Date().toISOString().split('T')[0]

      const [benhnhanRes, lichkhamRes, homnayRes, bacsiRes] = await Promise.all([
        apiClient.get('/benhnhan'),
        apiClient.get('/lichkham'),
        apiClient.get('/lichkham', { params: { date: today } }),
        apiClient.get('/bacsi'),
      ])

      setThoiKeshowing({
        tongbenhNhan: benhnhanRes.data.data?.length || 0,
        tonglichKham: lichkhamRes.data.data?.length || 0,
        homnaylichKham: homnayRes.data.data?.length || 0,
        bacsicoSan: bacsiRes.data.data?.length || 0,
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
        <h1>Thống Kê Nhanh</h1>
        <p>Tình hình hoạt động của phòng khám</p>
      </div>

      {loi && <div className="alert alert-danger">{loi}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#007bff' }}>
          </div>
          <div className="stat-content">
            <div className="stat-value">{thoikeshowing.tongbenhNhan}</div>
            <div className="stat-label">Tổng Bệnh Nhân</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#28a745' }}>
          </div>
          <div className="stat-content">
            <div className="stat-value">{thoikeshowing.tonglichKham}</div>
            <div className="stat-label">Tổng Lịch Khám</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ffc107' }}>
          </div>
          <div className="stat-content">
            <div className="stat-value">{thoikeshowing.homnaylichKham}</div>
            <div className="stat-label">Khám Hôm Nay</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#17a2b8' }}>
          </div>
          <div className="stat-content">
            <div className="stat-value">{thoikeshowing.bacsicoSan}</div>
            <div className="stat-label">Bác Sĩ Khả Dụng</div>
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
              <li>Sử dụng <strong>Lịch Khám Hôm Nay</strong> để xem danh sách bệnh nhân khám hôm nay</li>
              <li>Dùng <strong>Điều Phối Lịch</strong> để tìm giờ trống và sắp xếp lịch khám cho bệnh nhân</li>
              <li>Theo dõi thống kê để quản lý hiệu quả công việc</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
