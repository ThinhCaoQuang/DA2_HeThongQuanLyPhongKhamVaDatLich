import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import apiClient from '../services/api'
import '../styles/list.css'

const getLoaiThongBaoLabel = (loai) => {
  const labels = {
    'NhacLichKham': 'Nhắc nhở lịch khám',
    'XacNhanLichKham': 'Xác nhận lịch khám',
    'HuyLichKham': 'Hủy lịch khám',
    'YeuCauKham': 'Yêu cầu khám',
    'VanBan': 'Văn bản'
  }
  return labels[loai] || loai
}

const getLoaiThongBaoColor = (loai) => {
  const colors = {
    'NhacLichKham': 'info',
    'XacNhanLichKham': 'success',
    'HuyLichKham': 'danger',
    'YeuCauKham': 'warning',
    'VanBan': 'secondary'
  }
  return colors[loai] || 'gray'
}

export default function ThongBao() {
  const { user } = useContext(AuthContext)
  const [danhSachThongBao, setDanhSachThongBao] = useState([])
  const [dangTai, setDangTai] = useState(true)
  const [loi, setLoi] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [locDaDoc, setLocDaDoc] = useState('all') // all, doc, chua-doc

  useEffect(() => {
    layDanhSachThongBao()
  }, [page, locDaDoc])

  const layDanhSachThongBao = async () => {
    try {
      setDangTai(true)
      const params = { page, limit: 10 }
      
      if (locDaDoc === 'doc') {
        params.daDoc = 'true'
      } else if (locDaDoc === 'chua-doc') {
        params.daDoc = 'false'
      }

      const response = await apiClient.get('/thongbao', { params })
      setDanhSachThongBao(response.data.data || [])
      setPage(response.data.pagination?.page || 1)
      setTotalPages(response.data.pagination?.pages || 1)
      setLoi('')
    } catch (err) {
      setLoi('Không thể tải danh sách thông báo')
      console.error(err)
    } finally {
      setDangTai(false)
    }
  }

  const xulyDaDoc = async (thongbaoId) => {
    try {
      await apiClient.put(`/thongbao/${thongbaoId}/read`)
      await layDanhSachThongBao()
    } catch (err) {
      setLoi('Không thể cập nhật trạng thái')
      console.error(err)
    }
  }

  const xulyDaDocTatCa = async () => {
    try {
      await apiClient.put('/thongbao/read/all')
      await layDanhSachThongBao()
    } catch (err) {
      setLoi('Không thể cập nhật trạng thái')
      console.error(err)
    }
  }

  const xulyXoa = async (thongbaoId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      return
    }

    try {
      await apiClient.delete(`/thongbao/${thongbaoId}`)
      await layDanhSachThongBao()
    } catch (err) {
      setLoi('Không thể xóa thông báo')
      console.error(err)
    }
  }

  if (dangTai) return <div className="loading">Đang tải...</div>

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>Thông Báo</h1>
        {danhSachThongBao.some(tb => !tb.DaDoc) && (
          <button className="btn-primary" onClick={xulyDaDocTatCa}>
            Đánh dấu tất cả là đã đọc
          </button>
        )}
      </div>

      {loi && (
        <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
          {loi}
        </div>
      )}

      <div className="filter-section" style={{ marginBottom: '20px' }}>
        <div className="form-group">
          <label>Lọc:</label>
          <select 
            value={locDaDoc} 
            onChange={(e) => {
              setLocDaDoc(e.target.value)
              setPage(1)
            }}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="all">Tất cả</option>
            <option value="chua-doc">Chưa đọc</option>
            <option value="doc">Đã đọc</option>
          </select>
        </div>
      </div>

      {danhSachThongBao.length > 0 ? (
        <>
          <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
            {danhSachThongBao.map((thongbao) => (
              <div
                key={thongbao.ThongBaoId}
                className="card"
                style={{
                  borderLeft: `4px solid ${thongbao.DaDoc ? '#ddd' : '#007bff'}`,
                  opacity: thongbao.DaDoc ? 0.7 : 1,
                  backgroundColor: thongbao.DaDoc ? '#f9f9f9' : '#fff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                      <span className={`badge badge-${getLoaiThongBaoColor(thongbao.LoaiThongBao)}`}>
                        {getLoaiThongBaoLabel(thongbao.LoaiThongBao)}
                      </span>
                      {!thongbao.DaDoc && (
                        <span className="badge badge-warning">Chưa đọc</span>
                      )}
                    </div>

                    <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>
                      {thongbao.TieuDe}
                    </h3>

                    <p style={{ margin: '0 0 8px 0', color: '#666', lineHeight: '1.5' }}>
                      {thongbao.NoiDung}
                    </p>

                    <div style={{ display: 'flex', gap: '20px', fontSize: '0.85em', color: '#999' }}>
                      <span>
                        📅 {new Date(thongbao.ThoiGianGui).toLocaleString('vi-VN')}
                      </span>
                      {thongbao.DaDoc && thongbao.ThoiGianDoc && (
                        <span>
                          ✓ Đã đọc: {new Date(thongbao.ThoiGianDoc).toLocaleString('vi-VN')}
                        </span>
                      )}
                      {thongbao.LichKham && (
                        <span>
                          🏥 Lịch khám: {thongbao.LichKham.MaLichKham}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {!thongbao.DaDoc && (
                      <button
                        className="btn-small btn-success"
                        onClick={() => xulyDaDoc(thongbao.ThongBaoId)}
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                    <button
                      className="btn-small btn-danger"
                      onClick={() => xulyXoa(thongbao.ThongBaoId)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-secondary"
              >
                ← Trước
              </button>
              <span style={{ padding: '8px 12px', borderRadius: '4px', backgroundColor: '#e9ecef' }}>
                Trang {page}/{totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="btn-secondary"
              >
                Sau →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center" style={{ padding: '40px', color: '#999' }}>
          <p style={{ fontSize: '1.1em', marginBottom: '10px' }}>
            {locDaDoc === 'chua-doc' ? '✓ Bạn đã đọc hết tất cả thông báo!' : 'Không có thông báo'}
          </p>
        </div>
      )}
    </div>
  )
}
