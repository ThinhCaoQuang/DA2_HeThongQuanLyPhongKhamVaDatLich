import { useState, useEffect } from 'react'
import apiClient from '../services/api'
import '../styles/list.css'

export default function ChuyenKhoa() {
  const [danhsachchuyenkhoa, setDanhSachChuyenKhoa] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
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

  // Filter danh sách chuyên khoa theo từ khóa tìm kiếm
  const danhsachloc = danhsachchuyenkhoa.filter(ck => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      ck.TenChuyenKhoa?.toLowerCase().includes(term) ||
      ck.MoTa?.toLowerCase().includes(term)
    )
  })

  if (dangta) return <div className="loading">Đang tải...</div>

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>Danh Sách Chuyên Khoa</h1>
      </div>

      {loi && <div className="alert alert-danger">{loi}</div>}

      <div className="search-bar" style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc mô tả chuyên khoa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 15px',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            outline: 'none'
          }}
        />
      </div>

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
            {danhsachloc.length > 0 ? (
              danhsachloc.map((chuyenkhoa) => (
                <tr key={chuyenkhoa.ChuyenKhoaId}>
                  <td>{chuyenkhoa.ChuyenKhoaId}</td>
                  <td>{chuyenkhoa.TenChuyenKhoa || '-'}</td>
                  <td>{chuyenkhoa.MoTa || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">
                  {searchTerm ? 'Không tìm thấy chuyên khoa nào' : 'Không có chuyên khoa nào'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
