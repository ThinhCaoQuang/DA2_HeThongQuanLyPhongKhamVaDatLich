import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
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

export default function LichKhamCuaToi() {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [danhsachlichkham, setDanhSachLichKham] = useState([])
  const [dangta, setDangTa] = useState(true)
  const [loi, setLoi] = useState('')

  useEffect(() => {
    layLichKhamCuaToi()
  }, [])

  const layLichKhamCuaToi = async () => {
    try {
      setDangTa(true)
      const response = await apiClient.get('/lichkham')
      setDanhSachLichKham(response.data.data || [])
    } catch (err) {
      setLoi('Không thể tải lịch khám của bạn')
    } finally {
      setDangTa(false)
    }
  }

  const xulyXacNhanLichKham = async (lichkhamid) => {
    try {
      await apiClient.post(`/lichkham/${lichkhamid}/confirm`)
      await layLichKhamCuaToi()
    } catch (err) {
      setLoi('Không thể xác nhận lịch khám')
    }
  }

  const xulyHoanThanhLichKham = async (lichkhamid) => {
    try {
      await apiClient.post(`/lichkham/${lichkhamid}/complete`)
      await layLichKhamCuaToi()
    } catch (err) {
      setLoi('Không thể hoàn thành lịch khám')
    }
  }

  const xulyTaoHoSo = (lichkhamid) => {
    navigate('/medical-records', { 
      state: { lichKhamId: lichkhamid } 
    })
  }

  const laBacSi = user?.role === 'BacSi'
  const laLeTanHoacQuanTri = user?.role === 'LeTan' || user?.role === 'QuanTri'

  if (dangta) return <div className="loading">Đang tải...</div>

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>Lịch Khám Của Tôi</h1>
      </div>

      {loi && <div className="alert alert-danger">{loi}</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Mã Lịch</th>
              <th>Bệnh Nhân</th>
              <th>Thời Gian</th>
              <th>Triệu Chứng</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {danhsachlichkham.length > 0 ? (
              danhsachlichkham.map((lichkham) => (
                <tr key={lichkham.LichKhamId}>
                  <td>{lichkham.MaLichKham}</td>
                  <td>{lichkham.BenhNhan?.HoTen || '-'}</td>
                  <td>
                    {new Date(lichkham.ThoiGianBatDau).toLocaleString(
                      'vi-VN'
                    )}
                  </td>
                  <td>{lichkham.TrieuChung || '-'}</td>
                  <td>{getTrangThaiLabel(lichkham.TrangThai) || '-'}</td>
                  <td className="actions">
                    {lichkham.TrangThai === 'ChoXacNhan' && laLeTanHoacQuanTri && (
                      <button
                        className="btn-small btn-success"
                        onClick={() =>
                          xulyXacNhanLichKham(lichkham.LichKhamId)
                        }
                      >
                        Xác Nhận
                      </button>
                    )}
                    {lichkham.TrangThai === 'DaXacNhan' && laBacSi && (
                      <button
                        className="btn-small btn-info"
                        onClick={() =>
                          xulyHoanThanhLichKham(lichkham.LichKhamId)
                        }
                      >
                        Hoàn Thành
                      </button>
                    )}
                    {lichkham.TrangThai === 'DaXacNhan' && (laBacSi || laLeTanHoacQuanTri) && (
                      <button 
                        className="btn-small btn-primary"
                        onClick={() => xulyTaoHoSo(lichkham.LichKhamId)}
                      >
                        Tạo Hồ Sơ
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  Không có lịch khám nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
