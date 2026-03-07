import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import apiClient from '../services/api'
import '../styles/list.css'

const getTrangThaiLabel = (trangThai) => {
  const labels = {
    'ChoXacNhan': 'Chờ xác nhận',
    'DaXacNhan': 'Đã xác nhận',
    'DaKham': 'Đã khám',
    'DaHuy': 'Đã hủy',
  }
  return labels[trangThai] || trangThai
}

export default function LichKhamHomNay() {
  const { user } = useContext(AuthContext)
  const [danhsachlichkham, setDanhSachLichKham] = useState([])
  const [dangta, setDangTa] = useState(true)
  const [loi, setLoi] = useState('')

  useEffect(() => {
    layLichKhamHomNay()
  }, [user])

  const layLichKhamHomNay = async () => {
    try {
      setDangTa(true)
      const today = new Date().toISOString().split('T')[0]
      const response = await apiClient.get('/lichkham', {
        params: { date: today, doctor: user?.NguoiDungId }
      })
      setDanhSachLichKham(response.data.data || [])
      setLoi('')
    } catch (err) {
      setLoi('Không thể tải lịch khám hôm nay')
      console.error(err)
    } finally {
      setDangTa(false)
    }
  }

  const capNhatTrangThai = async (lichkhamId, trangThai) => {
    try {
      await apiClient.put(`/lichkham/${lichkhamId}`, { TrangThai: trangThai })
      await layLichKhamHomNay()
    } catch (err) {
      setLoi('Không thể cập nhật trạng thái')
      console.error(err)
    }
  }

  if (dangta) return <div className="loading">Đang tải...</div>

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>Lịch Khám Hôm Nay</h1>
        <p>Bác sĩ: {user?.HoTen}</p>
      </div>

      {loi && <div className="alert alert-danger">{loi}</div>}

      <div className="stats-cards" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="stat-value">{danhsachlichkham.length}</div>
          <div className="stat-label">Tổng lịch khám</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {danhsachlichkham.filter(a => a.TrangThai === 'ChoXacNhan').length}
          </div>
          <div className="stat-label">Chờ khám</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {danhsachlichkham.filter(a => a.TrangThai === 'DaKham').length}
          </div>
          <div className="stat-label">Đã khám</div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Giờ</th>
              <th>Bệnh Nhân</th>
              <th>Triệu Chứng</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {danhsachlichkham.length > 0 ? (
              danhsachlichkham.map((lichkham) => (
                <tr key={lichkham.LichKhamId}>
                  <td>{lichkham.GioKham || '-'}</td>
                  <td>{lichkham.BenhNhan?.HoTen || '-'}</td>
                  <td>{lichkham.TrieuChung || '-'}</td>
                  <td>
                    <span className={`badge badge-${lichkham.TrangThai === 'ChoXacNhan' ? 'warning' : 'success'}`}>
                      {getTrangThaiLabel(lichkham.TrangThai) || '-'}
                    </span>
                  </td>
                  <td className="actions">
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {lichkham.TrangThai !== 'DaKham' && (
                        <button
                          className="btn-small btn-success"
                          onClick={() => capNhatTrangThai(lichkham.LichKhamId, 'DaKham')}
                        >
                          Hoàn tất
                        </button>
                      )}
                      {lichkham.TrangThai !== 'DaHuy' && (
                        <button
                          className="btn-small btn-danger"
                          onClick={() => capNhatTrangThai(lichkham.LichKhamId, 'DaHuy')}
                        >
                          Hủy
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  Không có lịch khám hôm nay
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
