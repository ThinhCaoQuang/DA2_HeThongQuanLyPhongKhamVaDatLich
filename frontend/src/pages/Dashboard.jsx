import { useState, useEffect } from 'react'
import apiClient from '../services/api'
import '../styles/Dashboard.css'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [recentMedicalRecords, setRecentMedicalRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/dashboard/statistics')
      if (response.data.success) {
        const { stats: statsData, upcomingAppointments: appointments, recentMedicalRecords: records } = response.data.data
        setStats(statsData)
        setUpcomingAppointments(appointments || [])
        setRecentMedicalRecords(records || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Đang tải dữ liệu...</div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Bảng Điều Khiển</h1>
        <p className="subtitle">Tổng quan hệ thống quản lý phòng khám</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <StatCard
          label="Tổng Bệnh Nhân"
          value={stats?.totalPatients || 0}
          color="#3498db"
        />
        <StatCard
          label="Tổng Bác Sĩ"
          value={stats?.totalDoctors || 0}
          color="#2ecc71"
        />
        <StatCard
          label="Lịch Hôm Nay"
          value={stats?.appointmentsToday || 0}
          color="#f39c12"
        />
        <StatCard
          label="Lịch Tuần Này"
          value={stats?.appointmentsWeek || 0}
          color="#e74c3c"
        />
        <StatCard
          label="Hồ Sơ Tháng Này"
          value={stats?.medicalRecordsMonth || 0}
          color="#9b59b6"
        />
        <StatCard
          label="Tổng Đơn Thuốc"
          value={stats?.totalPrescriptions || 0}
          color="#1abc9c"
        />
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Upcoming Appointments */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Lịch Hẹn Sắp Tới</h2>
            <span className="count">{upcomingAppointments.length}</span>
          </div>

          {upcomingAppointments.length > 0 ? (
            <div className="appointments-list">
              {upcomingAppointments.map((apt, idx) => (
                <div key={idx} className="appointment-item">
                  <div className="apt-time">
                    {new Date(apt.ThoiGianBatDau).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="apt-details">
                    <div className="apt-patient">
                      <strong>{apt.BenhNhan?.HoTen || 'N/A'}</strong>
                    </div>
                    <div className="apt-doctor">
                      Bác sĩ: {apt.BacSi?.NguoiDung?.HoTen || 'N/A'}
                    </div>
                  </div>
                  <div className="apt-date">
                    {new Date(apt.ThoiGianBatDau).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">Không có lịch hẹn sắp tới</div>
          )}
        </div>

        {/* Recent Medical Records */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Hồ Sơ Khám Gần Đây</h2>
            <span className="count">{recentMedicalRecords.length}</span>
          </div>

          {recentMedicalRecords.length > 0 ? (
            <div className="records-list">
              {recentMedicalRecords.map((record, idx) => (
                <div key={idx} className="record-item">
                  <div className="record-info">
                    <div className="record-patient">
                      <strong>{record.BenhNhan?.HoTen || 'N/A'}</strong>
                    </div>
                    <div className="record-doctor">
                      Bác sĩ: {record.BacSi?.NguoiDung?.HoTen || 'N/A'}
                    </div>
                    <div className="record-date">
                      {new Date(record.CreatedAt).toLocaleDateString('vi-VN', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="record-code">
                    <span className="badge">{record.MaHoSo}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">Không có hồ sơ khám gần đây</div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="stat-card" style={{ borderTopColor: color }}>
      <div className="stat-value">{value.toLocaleString('vi-VN')}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
