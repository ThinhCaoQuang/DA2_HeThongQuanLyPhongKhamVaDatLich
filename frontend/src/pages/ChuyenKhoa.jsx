import { useState, useEffect } from 'react'
import apiClient from '../services/api'
import '../styles/list.css'

export default function ChuyenKhoa() {
  const [danhsachchuyenkhoa, setDanhSachChuyenKhoa] = useState([])
  const [dangta, setDangTa] = useState(true)
  const [loi, setLoi] = useState('')

  useEffect(() => {
    layDanhSachChuyenKhoa()
  }, [])

  const layDanhSachChuyenKhoa = async () => {
    try {
      setDangTa(true)
      const response = await apiClient.get('/chuyenkhoa')
      setDanhSachChuyenKhoa(response.data.data || [])
      setLoi('')
    } catch (err) {
      setLoi('Không thể tải danh sách chuyên khoa')
      console.error(err)
    } finally {
      setDangTa(false)
    }
  }

  if (dangta) return <div className="loading">Đang tải...</div>

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>Danh Sách Chuyên Khoa</h1>
      </div>

      {loi && <div className="alert alert-danger">{loi}</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Mã Chuyên Khoa</th>
              <th>Tên Chuyên Khoa</th>
              <th>Mô Tả</th>
            </tr>
          </thead>
          <tbody>
            {danhsachchuyenkhoa.length > 0 ? (
              danhsachchuyenkhoa.map((chuyenkhoa) => (
                <tr key={chuyenkhoa.ChuyenKhoaId}>
                  <td>{chuyenkhoa.ChuyenKhoaId}</td>
                  <td>{chuyenkhoa.TenChuyenKhoa || '-'}</td>
                  <td>{chuyenkhoa.MoTa || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">
                  Không có chuyên khoa nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
