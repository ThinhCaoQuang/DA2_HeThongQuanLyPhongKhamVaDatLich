import { useState, useEffect, useContext } from 'react'
import apiClient from '../services/api'
import { ToastContext } from '../context/ToastContext'
import { validateBenhNhan, hasErrors } from '../utils/validation'
import '../styles/list.css'

export default function BenhNhan() {
  const { success, error: showError } = useContext(ToastContext)
  const [danhsachbenhnhan, setDanhsachbenhnhan] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [moform, setMoform] = useState(false)
  const [idchinh, setIdchinh] = useState(null)
  const [dulieuform, setDulieuform] = useState({
    hoTen: '',
    dienThoai: '',
    email: '',
    diaChi: '',
    ngaySinh: '',
    cccd: '',
    gioiTinh: '',
  })
  const [loisuform, setLoiSuForm] = useState({})

  useEffect(() => {
    layDanhsachbenhnhan()
  }, [])

  const layDanhsachbenhnhan = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/benhnhan')
      setDanhsachbenhnhan(response.data.data)
    } catch (err) {
      showError('Không thể tải danh sách bệnh nhân')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const xulyThayDoiInput = (e) => {
    const { name, value } = e.target
    setDulieuform((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (loisuform[name]) {
      setLoiSuForm((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const xulyGuiForm = async (e) => {
    e.preventDefault()
    
    // Validate form
    const errors = validateBenhNhan(dulieuform)
    if (hasErrors(errors)) {
      setLoiSuForm(errors)
      showError('Vui lòng kiểm tra các trường thông tin')
      return
    }

    try {
      setSubmitting(true)
      console.log('Sending data:', dulieuform)
      
      if (idchinh) {
        await apiClient.put(`/benhnhan/${idchinh}`, dulieuform)
        success('Cập nhật bệnh nhân thành công')
      } else {
        await apiClient.post('/benhnhan', dulieuform)
        success('Thêm bệnh nhân mới thành công')
      }
      setDulieuform({ hoTen: '', dienThoai: '', email: '', diaChi: '', ngaySinh: '', cccd: '', gioiTinh: '' })
      setLoiSuForm({})
      setIdchinh(null)
      setMoform(false)
      layDanhsachbenhnhan()
    } catch (err) {
      console.error('Error response:', err.response?.data)
      showError(err.response?.data?.message || 'Lỗi khi lưu bệnh nhân')
    } finally {
      setSubmitting(false)
    }
  }

  const xulyChinhsua = (benhnhan) => {
    setDulieuform({
      hoTen: benhnhan.HoTen || '',
      dienThoai: benhnhan.DienThoai || '',
      email: benhnhan.Email || '',
      diaChi: benhnhan.DiaChi || '',
      ngaySinh: benhnhan.NgaySinh ? benhnhan.NgaySinh.split('T')[0] : '',
      cccd: benhnhan.CCCD || '',
      gioiTinh: benhnhan.GioiTinh || '',
    })
    setLoiSuForm({})
    setIdchinh(benhnhan.BenhNhanId)
    setMoform(true)
  }

  const xulyXoa = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa bệnh nhân này?')) return

    try {
      await apiClient.delete(`/benhnhan/${id}`)
      success('Xóa bệnh nhân thành công')
      layDanhsachbenhnhan()
    } catch (err) {
      showError('Không thể xóa bệnh nhân')
    }
  }

  const xulyHuy = () => {
    setMoform(false)
    setIdchinh(null)
    setDulieuform({ hoTen: '', dienThoai: '', email: '', diaChi: '', ngaySinh: '', cccd: '', gioiTinh: '' })
    setLoiSuForm({})
  }

  // Filter danh sách bệnh nhân theo từ khóa tìm kiếm
  const danhsachlocbenhnhan = danhsachbenhnhan.filter(bn => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      bn.HoTen?.toLowerCase().includes(term) ||
      bn.DienThoai?.includes(term) ||
      bn.CCCD?.includes(term) ||
      bn.Email?.toLowerCase().includes(term)
    )
  })

  if (loading) return <div className="loading">Đang tải...</div>

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>Quản Lý Bệnh Nhân</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setMoform(true)
            setLoiSuForm({})
          }}
          disabled={moform}
        >
          Thêm Bệnh Nhân Mới
        </button>
      </div>

      {!moform && (
        <div className="search-bar" style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, số điện thoại, CCCD, email..."
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
      )}

      {moform && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              {idchinh ? 'Cập Nhật Bệnh Nhân' : 'Thêm Bệnh Nhân Mới'}
            </h2>
          </div>
          <form onSubmit={xulyGuiForm} className="form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="hoTen">Họ Tên *</label>
                <input
                  type="text"
                  id="hoTen"
                  name="hoTen"
                  value={dulieuform.hoTen}
                  onChange={xulyThayDoiInput}
                  className={loisuform.hoTen ? 'input-error' : ''}
                />
                {loisuform.hoTen && (
                  <div className="field-error">{loisuform.hoTen}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="dienThoai">Điện Thoại *</label>
                <input
                  type="tel"
                  id="dienThoai"
                  name="dienThoai"
                  value={dulieuform.dienThoai}
                  onChange={xulyThayDoiInput}
                  placeholder="0123456789"
                  className={loisuform.dienThoai ? 'input-error' : ''}
                />
                {loisuform.dienThoai && (
                  <div className="field-error">{loisuform.dienThoai}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={dulieuform.email}
                  onChange={xulyThayDoiInput}
                  className={loisuform.email ? 'input-error' : ''}
                />
                {loisuform.email && (
                  <div className="field-error">{loisuform.email}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="diaChi">Địa Chỉ</label>
                <input
                  type="text"
                  id="diaChi"
                  name="diaChi"
                  value={dulieuform.diaChi}
                  onChange={xulyThayDoiInput}
                  className={loisuform.diaChi ? 'input-error' : ''}
                />
                {loisuform.diaChi && (
                  <div className="field-error">{loisuform.diaChi}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ngaySinh">Ngày Sinh *</label>
                <input
                  type="date"
                  id="ngaySinh"
                  name="ngaySinh"
                  value={dulieuform.ngaySinh}
                  onChange={xulyThayDoiInput}
                  className={loisuform.ngaySinh ? 'input-error' : ''}
                />
                {loisuform.ngaySinh && (
                  <div className="field-error">{loisuform.ngaySinh}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="gioiTinh">Giới Tính *</label>
                <select
                  id="gioiTinh"
                  name="gioiTinh"
                  value={dulieuform.gioiTinh}
                  onChange={xulyThayDoiInput}
                  className={loisuform.gioiTinh ? 'input-error' : ''}
                >
                  <option value="">-- Chọn giới tính --</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khac">Khác</option>
                </select>
                {loisuform.gioiTinh && (
                  <div className="field-error">{loisuform.gioiTinh}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cccd">Căn Cước Công Dân *</label>
                <input
                  type="text"
                  id="cccd"
                  name="cccd"
                  value={dulieuform.cccd}
                  onChange={xulyThayDoiInput}
                  placeholder="123456789012"
                  maxLength="12"
                  className={loisuform.cccd ? 'input-error' : ''}
                />
                {loisuform.cccd && (
                  <div className="field-error">{loisuform.cccd}</div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Đang lưu...' : (idchinh ? 'Cập Nhật' : 'Thêm Mới')}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={xulyHuy}
                disabled={submitting}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Mã Bệnh Nhân</th>
              <th>Họ Tên</th>
              <th>Ngày Sinh</th>
              <th>Giới Tính</th>
              <th>CCCD</th>
              <th>Điện Thoại</th>
              <th>Email</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {danhsachlocbenhnhan.length > 0 ? (
              danhsachlocbenhnhan.map((benhnhan) => (
                <tr key={benhnhan.BenhNhanId}>
                  <td>{benhnhan.MaBenhNhan}</td>
                  <td>{benhnhan.HoTen}</td>
                  <td>{benhnhan.NgaySinh ? new Date(benhnhan.NgaySinh).toLocaleDateString('vi-VN') : '-'}</td>
                  <td>{benhnhan.GioiTinh === 'Nam' ? 'Nam' : benhnhan.GioiTinh === 'Nữ' ? 'Nữ' : 'Khác'}</td>
                  <td>{benhnhan.CCCD || '-'}</td>
                  <td>{benhnhan.DienThoai || '-'}</td>
                  <td>{benhnhan.Email || '-'}</td>
                  <td className="actions">
                    <button
                      className="btn-small btn-primary"
                      onClick={() => xulyChinhsua(benhnhan)}
                    >
                      Cập nhật
                    </button>
                    <button
                      className="btn-small btn-danger"
                      onClick={() => xulyXoa(benhnhan.BenhNhanId)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">
                  Không có bệnh nhân nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
