import { useState, useEffect, useContext } from 'react'
import apiClient from '../services/api'
import { ToastContext } from '../context/ToastContext'
import { AuthContext } from '../context/AuthContext'
import { validateBacSi, hasErrors } from '../utils/validation'
import '../styles/list.css'

export default function BacSi() {
  const { success, error: showError } = useContext(ToastContext)
  const { user } = useContext(AuthContext)
  const [danhsachbacsi, setDanhsachbacsi] = useState([])
  const [danhsachchuyenkhoa, setDanhsachchuyenkhoa] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [moform, setMoform] = useState(false)
  const [idchinh, setIdchinh] = useState(null)
  const [dulieuform, setDulieuform] = useState({
    hoTen: '',
    dienThoai: '',
    email: '',
    diaChi: '',
    soChungChi: '',
    chuyenKhoaId: '',
    capHocVan: '',
    namKinhNghiem: '',
  })
  const [loisuform, setLoiSuform] = useState({})

  // Check if user is admin
  const laAdmin = user?.role === 'QuanTri'

  useEffect(() => {
    layDuLieu()
  }, [])

  const layDuLieu = async () => {
    try {
      setLoading(true)
      const [bacsiRes, chuyenkhoanRes] = await Promise.all([
        apiClient.get('/bacsi?limit=1000'),
        apiClient.get('/chuyenkhoa'),
      ])

      setDanhsachbacsi(bacsiRes.data.data || [])
      setDanhsachchuyenkhoa(chuyenkhoanRes.data.data || [])
    } catch (err) {
      showError('Không thể tải dữ liệu')
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
    if (loisuform[name]) {
      setLoiSuform((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const xulyGuiForm = async (e) => {
    e.preventDefault()

    const errors = validateBacSi(dulieuform)
    if (hasErrors(errors)) {
      setLoiSuform(errors)
      showError('Vui lòng kiểm tra các trường thông tin')
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        HoTen: dulieuform.hoTen,
        DienThoai: dulieuform.dienThoai,
        Email: dulieuform.email,
        DiaChi: dulieuform.diaChi,
        SoChungChi: dulieuform.soChungChi,
        ChuyenKhoaId: parseInt(dulieuform.chuyenKhoaId),
        CapHocVan: dulieuform.capHocVan,
        NamKinhNghiem: dulieuform.namKinhNghiem ? parseInt(dulieuform.namKinhNghiem) : null,
      }

      if (idchinh) {
        await apiClient.put(`/bacsi/${idchinh}`, payload)
        success('Cập nhật bác sĩ thành công')
      } else {
        await apiClient.post('/bacsi', payload)
        success('Tạo bác sĩ mới thành công')
      }

      setDulieuform({
        hoTen: '',
        dienThoai: '',
        email: '',
        diaChi: '',
        soChungChi: '',
        chuyenKhoaId: '',
        capHocVan: '',
        namKinhNghiem: '',
      })
      setLoiSuform({})
      setIdchinh(null)
      setMoform(false)
      layDuLieu()
    } catch (err) {
      console.error('Error:', err.response?.data)
      const errorMessage = err.response?.data?.message || 'Lỗi khi lưu thông tin bác sĩ'
      showError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const xulyChinhsua = (bacsi) => {
    setDulieuform({
      hoTen: bacsi.NguoiDung?.HoTen || '',
      dienThoai: bacsi.NguoiDung?.DienThoai || '',
      email: bacsi.NguoiDung?.Email || '',
      diaChi: bacsi.NguoiDung?.DiaChi || '',
      soChungChi: bacsi.SoChungChi || '',
      chuyenKhoaId: bacsi.BacSiChuyenKhoas?.[0]?.ChuyenKhoaId || '',
      capHocVan: bacsi.CapHocVan || '',
      namKinhNghiem: bacsi.NamKinhNghiem || '',
    })
    setLoiSuform({})
    setIdchinh(bacsi.BacSiId)
    setMoform(true)
  }

  const xulyXoa = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa bác sĩ này?')) return

    try {
      await apiClient.delete(`/bacsi/${id}`)
      success('Xóa bác sĩ thành công')
      layDuLieu()
    } catch (err) {
      showError('Không thể xóa bác sĩ')
      console.error(err)
    }
  }

  const xulyHuy = () => {
    setMoform(false)
    setIdchinh(null)
    setDulieuform({
      hoTen: '',
      dienThoai: '',
      email: '',
      diaChi: '',
      soChungChi: '',
      chuyenKhoaId: '',
      capHocVan: '',
      namKinhNghiem: '',
    })
    setLoiSuform({})
  }

  const layTenChuyenKhoa = (id) => {
    const chuyenkhoa = danhsachchuyenkhoa.find(s => s.ChuyenKhoaId === id)
    return chuyenkhoa ? chuyenkhoa.TenChuyenKhoa : '-'
  }

  if (loading) return <div className="loading">Đang tải...</div>

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>Quản Lý Bác Sĩ</h1>
        {laAdmin && (
          <button
            className="btn-primary"
            onClick={() => {
              setMoform(true)
              setLoiSuform({})
            }}
            disabled={moform}
          >
            ➕ Thêm bác sĩ
          </button>
        )}
      </div>

      {moform && laAdmin && (
        <div className="form-container">
          <h2>{idchinh ? 'Sửa thông tin bác sĩ' : 'Thêm bác sĩ mới'}</h2>
          <form onSubmit={xulyGuiForm}>
            <div className="form-row">
              <div className="form-group">
                <label>Họ tên *</label>
                <input
                  type="text"
                  name="hoTen"
                  value={dulieuform.hoTen}
                  onChange={xulyThayDoiInput}
                  placeholder="Nhập họ tên"
                />
                {loisuform.hoTen && <span className="field-error">{loisuform.hoTen}</span>}
              </div>

              <div className="form-group">
                <label>Số điện thoại *</label>
                <input
                  type="tel"
                  name="dienThoai"
                  value={dulieuform.dienThoai}
                  onChange={xulyThayDoiInput}
                  placeholder="Nhập số điện thoại"
                />
                {loisuform.dienThoai && <span className="field-error">{loisuform.dienThoai}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={dulieuform.email}
                  onChange={xulyThayDoiInput}
                  placeholder="Nhập email"
                />
                {loisuform.email && <span className="field-error">{loisuform.email}</span>}
              </div>

              <div className="form-group">
                <label>Số chứng chỉ *</label>
                <input
                  type="text"
                  name="soChungChi"
                  value={dulieuform.soChungChi}
                  onChange={xulyThayDoiInput}
                  placeholder="Nhập số chứng chỉ"
                />
                {loisuform.soChungChi && <span className="field-error">{loisuform.soChungChi}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Chuyên khoa *</label>
                <select
                  name="chuyenKhoaId"
                  value={dulieuform.chuyenKhoaId}
                  onChange={xulyThayDoiInput}
                >
                  <option value="">-- Chọn chuyên khoa --</option>
                  {danhsachchuyenkhoa.map((s) => (
                    <option key={s.ChuyenKhoaId} value={s.ChuyenKhoaId}>
                      {s.TenChuyenKhoa}
                    </option>
                  ))}
                </select>
                {loisuform.chuyenKhoaId && <span className="field-error">{loisuform.chuyenKhoaId}</span>}
              </div>

              <div className="form-group">
                <label>Cấp học vấn</label>
                <input
                  type="text"
                  name="capHocVan"
                  value={dulieuform.capHocVan}
                  onChange={xulyThayDoiInput}
                  placeholder="vd: Tiến sĩ, Thạc sĩ"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Năm kinh nghiệm</label>
                <input
                  type="number"
                  name="namKinhNghiem"
                  value={dulieuform.namKinhNghiem}
                  onChange={xulyThayDoiInput}
                  placeholder="vd: 10"
                  min="0"
                  max="60"
                />
              </div>

              <div className="form-group">
                <label>Địa chỉ</label>
                <input
                  type="text"
                  name="diaChi"
                  value={dulieuform.diaChi}
                  onChange={xulyThayDoiInput}
                  placeholder="Nhập địa chỉ"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Đang lưu...' : 'Lưu'}
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
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Số điện thoại</th>
              <th>Email</th>
              <th>Chuyên khoa</th>
              <th>Cấp học vấn</th>
              <th>Kinh nghiệm (năm)</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {danhsachbacsi.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">Chưa có dữ liệu</td>
              </tr>
            ) : (
              danhsachbacsi.map((bacsi) => (
                <tr key={bacsi.BacSiId}>
                  <td>{bacsi.BacSiId}</td>
                  <td>{bacsi.NguoiDung?.HoTen || '-'}</td>
                  <td>{bacsi.NguoiDung?.DienThoai || '-'}</td>
                  <td>{bacsi.NguoiDung?.Email || '-'}</td>
                  <td>
                    {bacsi.BacSiChuyenKhoas?.[0]?.ChuyenKhoa?.TenChuyenKhoa ||
                      (bacsi.BacSiChuyenKhoas?.[0]
                        ? layTenChuyenKhoa(bacsi.BacSiChuyenKhoas[0].ChuyenKhoaId)
                        : '-')}
                  </td>
                  <td>{bacsi.CapHocVan || '-'}</td>
                  <td>{bacsi.NamKinhNghiem || '-'}</td>
                  <td>
                    {laAdmin ? (
                      <>
                        <button
                          className="btn-edit btn-success"
                          onClick={() => xulyChinhsua(bacsi)}
                          disabled={moform}
                        >
                          Cập nhật
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => xulyXoa(bacsi.BacSiId)}
                          disabled={moform}
                        >
                          Xóa
                        </button>
                      </>
                    ) : (
                      <span style={{ color: '#999' }}>Không có quyền</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
