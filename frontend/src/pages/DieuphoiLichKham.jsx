import { useState, useEffect } from 'react'
import apiClient from '../services/api'
import '../styles/list.css'

export default function DieuphoiLichKham() {
  const [danhsachlichlamviec, setDanhSachLichLamViec] = useState([])
  const [danhsachbacsi, setDanhSachBacSi] = useState([])
  const [dangta, setDangTa] = useState(true)
  const [loi, setLoi] = useState('')
  const [ngayDaChon, setNgayDaChon] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [bacsiDaChon, setBacSiDaChon] = useState('')

  useEffect(() => {
    layDanhSachBacSi()
    layDanhSachLichLamViec()
  }, [ngayDaChon, bacsiDaChon])

  const layDanhSachBacSi = async () => {
    try {
      const response = await apiClient.get('/bacsi')
      setDanhSachBacSi(response.data.data || [])
    } catch (err) {
      console.error('Lỗi tải danh sách bác sĩ:', err)
    }
  }

  const layDanhSachLichLamViec = async () => {
    try {
      setDangTa(true)
      let url = `/lichlamviec?ngayLamViec=${ngayDaChon}`
      if (bacsiDaChon) url += `&bacSiId=${bacsiDaChon}`
      const response = await apiClient.get(url)
      setDanhSachLichLamViec(response.data.data || [])
      setLoi('')
    } catch (err) {
      setLoi('Không thể tải lịch làm việc')
      console.error(err)
    } finally {
      setDangTa(false)
    }
  }

  const layGioTrong = (lichlamviec) => {
    const gios = []
    if (lichlamviec.GioBatDau && lichlamviec.GioKetThuc) {
      // Mô phỏng 30 phút/slot
      gios.push(`${lichlamviec.GioBatDau}`)
    }
    return gios
  }

  if (dangta) return <div className="loading">Đang tải...</div>

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>Điều Phối Lịch Khám</h1>
      </div>

      {loi && <div className="alert alert-danger">{loi}</div>}

      <div className="card" style={{ marginBottom: '30px' }}>
        <div className="card-header">
          <h3>Bộ Lọc</h3>
        </div>
        <div className="form" style={{ padding: '20px' }}>
          <div className="form-row">
            <div className="form-group">
              <label>Ngày Khám</label>
              <input
                type="date"
                value={ngayDaChon}
                onChange={(e) => setNgayDaChon(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Bác Sĩ</label>
              <select
                value={bacsiDaChon}
                onChange={(e) => setBacSiDaChon(e.target.value)}
              >
                <option value="">-- Tất cả bác sĩ --</option>
                {danhsachbacsi.map((bacsi) => (
                  <option key={bacsi.BacSiId} value={bacsi.BacSiId}>
                    {bacsi.NguoiDung?.HoTen || '-'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Bác Sĩ</th>
              <th>Ngày</th>
              <th>Giờ Làm Việc</th>
              <th>Trạng Thái</th>
              <th>Giờ Trống</th>
            </tr>
          </thead>
          <tbody>
            {danhsachlichlamviec.length > 0 ? (
              danhsachlichlamviec.map((lichlamviec) => (
                <tr key={lichlamviec.LichLamViecId}>
                  <td>{lichlamviec.BacSi?.NguoiDung?.HoTen || '-'}</td>
                  <td>{new Date(lichlamviec.NgayLamViec).toLocaleDateString('vi-VN')}</td>
                  <td>{`${lichlamviec.GioBatDau} - ${lichlamviec.GioKetThuc}`}</td>
                  <td>
                    <span className="badge badge-success">{lichlamviec.TrangThai}</span>
                  </td>
                  <td>
                    {layGioTrong(lichlamviec)
                      .map((gio) => (
                        <span key={gio} className="badge badge-info" style={{ marginRight: '5px' }}>
                          {gio}
                        </span>
                      ))}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  Không có lịch làm việc khả dụng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
