import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()

  useEffect(() => {
    layDanhSachBacSi()
  }, [])

  useEffect(() => {
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
      let url = `/lichlamviec?ngayLamViec=${ngayDaChon}&limit=100`
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

  const layTenCaLam = (caLam) => {
    const map = { Sang: 'Sáng', Chieu: 'Chiều', Toi: 'Tối' }
    return map[caLam] || caLam
  }

  const xulyTaoLichKham = (llv) => {
    navigate('/lichkham', {
      state: {
        prefill: {
          bacSiId: llv.BacSiId,
          thoiGianBatDau: `${ngayDaChon}T${llv.GioBatDau || '07:00'}`,
        }
      }
    })
  }

  if (dangta) return <div className="loading">Đang tải...</div>

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>Điều Phối Lịch Khám</h1>
      </div>

      {loi && <div className="alert alert-danger">{loi}</div>}

      <div className="card" style={{ marginBottom: '24px' }}>
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
              <th>Ca Làm</th>
              <th>Giờ Làm Việc</th>
              <th>Đã Đặt / Tối Đa</th>
              <th>Chỗ Còn Lại</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {danhsachlichlamviec.length > 0 ? (
              danhsachlichlamviec.map((llv) => {
                const conLai = llv.soChoConLai ?? (llv.SoBenhNhanToiDa || 10)
                const daDat   = llv.soLichDaDat ?? 0
                const toiDa   = llv.SoBenhNhanToiDa || 10
                const hetCho  = conLai === 0 || llv.TrangThai === 'Huy'
                return (
                  <tr key={llv.LichLamViecId}>
                    <td><strong>{llv.BacSi?.NguoiDung?.HoTen || '-'}</strong></td>
                    <td>{new Date(llv.NgayLamViec).toLocaleDateString('vi-VN')}</td>
                    <td>{layTenCaLam(llv.CaLam)}</td>
                    <td>{llv.GioBatDau?.slice(0,5)} – {llv.GioKetThuc?.slice(0,5)}</td>
                    <td style={{ textAlign: 'center' }}>{daDat} / {toiDa}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge badge-${hetCho ? 'danger' : conLai <= 2 ? 'warning' : 'success'}`}>
                        {hetCho ? 'Hết chỗ' : `${conLai} chỗ`}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${llv.TrangThai === 'HoatDong' ? 'success' : 'danger'}`}>
                        {llv.TrangThai === 'HoatDong' ? 'Hoạt động' : 'Đã hủy'}
                      </span>
                    </td>
                    <td>
                      {!hetCho && (
                        <button
                          className="btn-small btn-primary"
                          onClick={() => xulyTaoLichKham(llv)}
                        >
                          Đặt Lịch
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="8" className="text-center">
                  Không có lịch làm việc khả dụng cho ngày này
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
