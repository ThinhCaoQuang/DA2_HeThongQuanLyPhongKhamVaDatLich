import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import apiClient from '../services/api'
import '../styles/list.css'

const getTrangThaiLabel = (trangThai) => {
  const labels = {
    'ChoXacNhan': 'Chờ xác nhận',
    'DaXacNhan': 'Đã xác nhận',
    'DangKham': 'Đang khám',
    'DaKham': 'Đã khám',
    'DaHuy': 'Đã hủy',
  }
  return labels[trangThai] || trangThai
}

export default function LichKhamCuaToi() {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [danhsachlichkham, setDanhSachLichKham] = useState([])
  const [danhsachlankham, setDanhSachLanKham] = useState([])
  const [dangta, setDangTa] = useState(true)
  const [loi, setLoi] = useState('')

  useEffect(() => {
    layLichKhamCuaToi()
  }, [])

  const layLichKhamCuaToi = async () => {
    try {
      setDangTa(true)
      const [lichkhamRes, lankhamRes] = await Promise.all([
        apiClient.get('/lichkham'),
        apiClient.get('/lankham'),
      ])
      setDanhSachLichKham(lichkhamRes.data.data || [])
      setDanhSachLanKham(lankhamRes.data.data || [])
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

  const xulyTaoHoSo = async (lichkham) => {
    try {
      const res = await apiClient.post('/hosokhambenh/find-or-create', {
        benhNhanId: lichkham.BenhNhanId
      })
      const hoSoId = res.data.data.HoSoId
      navigate('/medical-records', { state: { hoSoId, lichKhamId: lichkham.LichKhamId, fromWorkflow: true } })
    } catch {
      navigate('/medical-records', { state: { lichKhamId: lichkham.LichKhamId, fromWorkflow: true } })
    }
  }

  const laBacSi = user?.role === 'BacSi'
  const laLeTanHoacQuanTri = user?.role === 'LeTan' || user?.role === 'QuanTri' || user?.role === 'QuanLy'

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
                    {(lichkham.TrangThai === 'DaXacNhan' || lichkham.TrangThai === 'DangKham') && laBacSi && (
                      <button
                        className="btn-small btn-info"
                        onClick={() =>
                          xulyHoanThanhLichKham(lichkham.LichKhamId)
                        }
                      >
                        Hoàn Thành
                      </button>
                    )}
                    {(lichkham.TrangThai === 'DaXacNhan' || lichkham.TrangThai === 'DangKham') && (laBacSi || laLeTanHoacQuanTri) && (() => {
                      const daCoLanKham = danhsachlankham.some(lk => lk.LichKhamId === lichkham.LichKhamId)
                      return (
                        <button
                          className={`btn-small ${daCoLanKham ? 'btn-warning' : 'btn-primary'}`}
                          onClick={() => xulyTaoHoSo(lichkham)}
                        >
                          {daCoLanKham ? 'Cập Nhật Lần Khám' : 'Tạo Lần Khám'}
                        </button>
                      )
                    })()}
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
