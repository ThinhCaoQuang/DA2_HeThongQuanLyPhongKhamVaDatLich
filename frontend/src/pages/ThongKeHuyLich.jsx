import { useState, useEffect } from 'react'
import apiClient from '../services/api'
import '../styles/dashboard.css'

export default function ThongKeHuyLich() {
  const [statistics, setStatistics] = useState(null)
  const [trends, setTrends] = useState([])
  const [reasons, setReasons] = useState(null)
  const [byDoctor, setByDoctor] = useState([])
  const [bySpecialty, setBySpecialty] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeRange, setTimeRange] = useState('3') // months

  useEffect(() => {
    fetchAllData()
  }, [timeRange])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [statsRes, trendsRes, reasonsRes, doctorRes, specialtyRes] = await Promise.all([
        apiClient.get('/dashboard/cancellation-statistics'),
        apiClient.get(`/dashboard/cancellation-trends?months=${timeRange}`),
        apiClient.get('/dashboard/cancellation-reasons'),
        apiClient.get('/dashboard/cancellation-by-doctor?limit=5'),
        apiClient.get('/dashboard/cancellation-by-specialty')
      ])

      if (statsRes.data.success) setStatistics(statsRes.data.data)
      if (trendsRes.data.success) setTrends(trendsRes.data.data)
      if (reasonsRes.data.success) setReasons(reasonsRes.data.data)
      if (doctorRes.data.success) setByDoctor(doctorRes.data.data.doctors)
      if (specialtyRes.data.success) setBySpecialty(specialtyRes.data.data.specialties)
      
      setError('')
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Không thể tải dữ liệu thống kê')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Đang tải...</div>
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Thống Kê Hủy Lịch Khám</h1>
        <div className="filter-group">
          <label>Khoảng thời gian:</label>
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="3">3 tháng</option>
            <option value="6">6 tháng</option>
            <option value="12">12 tháng</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Tổng quan */}
      {statistics && (
        <div className="stats-grid" style={{ marginBottom: '30px' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#007bff' }}>
            </div>
            <div className="stat-content">
              <div className="stat-value">{statistics.totalAppointments}</div>
              <div className="stat-label">Tổng Lịch Khám</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#dc3545' }}>
            </div>
            <div className="stat-content">
              <div className="stat-value">{statistics.cancelledAppointments}</div>
              <div className="stat-label">Lịch Bị Hủy</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#ffc107' }}>
            </div>
            <div className="stat-content">
              <div className="stat-value">{statistics.cancellationRate}%</div>
              <div className="stat-label">Tỷ Lệ Hủy</div>
            </div>
          </div>
        </div>
      )}

      {/* Xu hướng theo tháng */}
      <div className="card" style={{ marginBottom: '30px' }}>
        <div className="card-header">
          <h3>Xu Hướng Hủy Lịch Theo Tháng</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tháng</th>
                <th>Tổng Lịch</th>
                <th>Lịch Hủy</th>
                <th>Tỷ Lệ Hủy</th>
              </tr>
            </thead>
            <tbody>
              {trends.map((trend, idx) => (
                <tr key={idx}>
                  <td>{trend.month}</td>
                  <td>{trend.totalAppointments}</td>
                  <td style={{ color: '#dc3545' }}>{trend.cancelledAppointments}</td>
                  <td>
                    <span 
                      className={`badge ${trend.cancellationRate > 20 ? 'bg-danger' : trend.cancellationRate > 10 ? 'bg-warning' : 'bg-success'}`}
                      style={{ 
                        padding: '0.4rem 0.8rem',
                        borderRadius: '20px',
                        color: 'white',
                        backgroundColor: trend.cancellationRate > 20 ? '#dc3545' : trend.cancellationRate > 10 ? '#ffc107' : '#28a745'
                      }}
                    >
                      {trend.cancellationRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lý do hủy */}
      {reasons && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <div className="card-header">
            <h3>Lý Do Hủy Phổ Biến</h3>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Lý Do</th>
                  <th>Số Lượng</th>
                  <th>Tỷ Lệ</th>
                </tr>
              </thead>
              <tbody>
                {reasons.reasonsBreakdown.map((reason, idx) => (
                  <tr key={idx}>
                    <td>{reason.reason}</td>
                    <td>{reason.count}</td>
                    <td>{reason.percentage}%</td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <td><em>Không có lý do</em></td>
                  <td>{reasons.withoutReason.count}</td>
                  <td>{reasons.withoutReason.percentage}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Theo bác sĩ và chuyên khoa */}
      <div className="form-row">
        {/* Theo bác sĩ */}
        <div className="form-group" style={{ flex: 1 }}>
          <div className="card">
            <div className="card-header">
              <h3>Top Bác Sĩ Có Tỷ Lệ Hủy Cao</h3>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Bác Sĩ</th>
                    <th>Tỷ Lệ Hủy</th>
                  </tr>
                </thead>
                <tbody>
                  {byDoctor.map((doctor, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{doctor.doctorName}</strong>
                        <br />
                        <small style={{ color: '#6c757d' }}>{doctor.specialty}</small>
                        <br />
                        <small>{doctor.cancelledAppointments}/{doctor.totalAppointments} lịch</small>
                      </td>
                      <td>
                        <span 
                          className="badge"
                          style={{ 
                            padding: '0.4rem 0.8rem',
                            borderRadius: '20px',
                            color: 'white',
                            backgroundColor: doctor.cancellationRate > 20 ? '#dc3545' : doctor.cancellationRate > 10 ? '#ffc107' : '#28a745'
                          }}
                        >
                          {doctor.cancellationRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Theo chuyên khoa */}
        <div className="form-group" style={{ flex: 1 }}>
          <div className="card">
            <div className="card-header">
              <h3>Tỷ Lệ Hủy Theo Chuyên Khoa</h3>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Chuyên Khoa</th>
                    <th>Tỷ Lệ Hủy</th>
                  </tr>
                </thead>
                <tbody>
                  {bySpecialty.map((specialty, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{specialty.specialtyName}</strong>
                        <br />
                        <small>{specialty.cancelledAppointments}/{specialty.totalAppointments} lịch</small>
                      </td>
                      <td>
                        <span 
                          className="badge"
                          style={{ 
                            padding: '0.4rem 0.8rem',
                            borderRadius: '20px',
                            color: 'white',
                            backgroundColor: specialty.cancellationRate > 20 ? '#dc3545' : specialty.cancellationRate > 10 ? '#ffc107' : '#28a745'
                          }}
                        >
                          {specialty.cancellationRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
