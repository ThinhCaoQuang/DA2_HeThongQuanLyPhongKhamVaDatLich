import { useState, useEffect, useContext } from 'react'
import apiClient from '../services/api'
import { ToastContext } from '../context/ToastContext'
import { validateSchedule, hasErrors } from '../utils/validation'
import '../styles/list.css'

export default function ThoiGianLamViec() {
  const { success, error: showError } = useContext(ToastContext)
  const [danhsachlichlamviec, setDanhSachLichLamViec] = useState([])
  const [danhsachbacsi, setDanhSachBacSi] = useState([])
  const [nguoidunghientai, setNguoiDungHienTai] = useState(null)
  const [bacsihientai, setBacSiHienTai] = useState(null)
  const [dangta, setDangTa] = useState(true)
  const [dangguichitieuthucdung, setDangGuiChiTieuThuCDung] = useState(false)
  const [moform, setMoForm] = useState(false)
  const [idchinh, setIdChinh] = useState(null)
  const [dulieuform, setDuLieuForm] = useState({
    bacSiId: '',
    ngayLamViec: '',
    caLam: '',
    gioBatDau: '',
    gioKetThuc: '',
    soBenhNhanToiDa: '10',
    trangThai: 'HoatDong',
  })
  const [loisuform, setLoiSuForm] = useState({})
  const [loctheobacsiid, setLocTheoBacSiId] = useState('')
  const [timkiemtenbacsi, setTimKiemTenBacSi] = useState('')
  const [locthecalma, setLocTheoCalama] = useState('')
  const [loctheotrangthai, setLocTheoTrangThai] = useState('')
  const [loctheonaylamviec, setLocTheoNgayLamViec] = useState('')

  // Fetch current user and data
  useEffect(() => {
    const layNguoiDungHienTai = async () => {
      try {
        const meRes = await apiClient.get('/auth/me')
        setNguoiDungHienTai(meRes.data.data)
        console.log('Current user:', meRes.data.data)
        console.log('Current user NguoiDungId:', meRes.data.data?.NguoiDungId)
        
        // If user is BacSi, fetch their doctor profile
        if (meRes.data.data.VaiTro === 'BacSi') {
          const doctorsRes = await apiClient.get('/bacsi?limit=1000')
          console.log('All doctors:', doctorsRes.data.data)
          console.log('First doctor sample:', doctorsRes.data.data[0])
          
          const myDoctor = doctorsRes.data.data.find(doc => {
            console.log(`Comparing doc.NguoiDungId (${doc.NguoiDungId}) with user NguoiDungId (${meRes.data.data.NguoiDungId})`)
            return doc.NguoiDungId === meRes.data.data.NguoiDungId
          })
          console.log('Found my doctor:', myDoctor)
          
          if (myDoctor) {
            setBacSiHienTai(myDoctor)
            // Ensure bacSiId is set as string (for form field compatibility)
            setDuLieuForm(prev => ({ 
              ...prev, 
              bacSiId: String(myDoctor.BacSiId) 
            }))
            console.log('Set bacSiId:', myDoctor.BacSiId)
          }
        }
      } catch (err) {
        console.error('Error fetching current user:', err)
      }
    }
    layNguoiDungHienTai()
  }, [])

  useEffect(() => {
    laydulieu()
  }, [])

  const laydulieu = async () => {
    try {
      setDangTa(true)
      console.log('Fetching schedules...')
      const [lichlamviecRes, bacsRes] = await Promise.all([
        apiClient.get('/lichlamviec?limit=1000'),
        apiClient.get('/bacsi?limit=1000'),
      ])
      console.log('Fetched schedules:', lichlamviecRes.data.data)
      console.log('Setting schedules to state...')
      setDanhSachLichLamViec(lichlamviecRes.data.data || [])
      setDanhSachBacSi(bacsRes.data.data || [])
      console.log('State updated, schedules count:', lichlamviecRes.data.data?.length)
    } catch (err) {
      showError('Không thể tải dữ liệu')
      console.error(err)
    } finally {
      setDangTa(false)
    }
  }

  // Log when schedules state changes
  useEffect(() => {
    console.log('Schedules state changed, count:', danhsachlichlamviec.length)
  }, [danhsachlichlamviec])

  const xulyThayDoiInput = (e) => {
    const { name, value } = e.target
    let capNhatData = {
      ...dulieuform,
      [name]: value,
    }

    // Auto-set times based on shift selection
    if (name === 'caLam') {
      if (value === 'Sang') {
        capNhatData.gioBatDau = '08:00'
        capNhatData.gioKetThuc = '12:00'
      } else if (value === 'Chieu') {
        capNhatData.gioBatDau = '14:00'
        capNhatData.gioKetThuc = '17:00'
      } else if (value === 'Toi') {
        capNhatData.gioBatDau = '19:00'
        capNhatData.gioKetThuc = '21:00'
      }
    }

    setDuLieuForm(capNhatData)
    if (loisuform[name]) {
      setLoiSuForm((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const xulyGuiForm = async (e) => {
    e.preventDefault()

    // For BacSi, ensure bacSiId is set from bacsihientai
    let duLieuKiemTra = { ...dulieuform }
    if (nguoidunghientai?.VaiTro === 'BacSi') {
      // Force set bacSiId for BacSi
      duLieuKiemTra.bacSiId = bacsihientai?.BacSiId || dulieuform.bacSiId
      console.log('BacSi submit - forced bacSiId:', duLieuKiemTra.bacSiId)
    }

    console.log('Form data before validation:', duLieuKiemTra)
    const errors = validateSchedule(duLieuKiemTra, nguoidunghientai?.VaiTro)
    console.log('Validation errors:', errors)
    if (hasErrors(errors)) {
      setLoiSuForm(errors)
      showError('Vui lòng kiểm tra các trường thông tin')
      return
    }

    try {
      setDangGuiChiTieuThuCDung(true)
      
      // For BacSi, always use their own BacSiId
      let bacSiId;
      if (nguoidunghientai?.VaiTro === 'BacSi') {
        bacSiId = bacsihientai?.BacSiId
        console.log('BacSi - using bacsihientai.BacSiId:', bacsihientai?.BacSiId)
      } else {
        bacSiId = dulieuform.bacSiId ? parseInt(dulieuform.bacSiId) : null
      }
      
      console.log('Computed bacSiId:', bacSiId, 'type:', typeof bacSiId)
      
      const payload = {
        BacSiId: bacSiId,
        NgayLamViec: dulieuform.ngayLamViec,
        CaLam: dulieuform.caLam,
        GioBatDau: dulieuform.gioBatDau,
        GioKetThuc: dulieuform.gioKetThuc,
        SoBenhNhanToiDa: parseInt(dulieuform.soBenhNhanToiDa),
        TrangThai: dulieuform.trangThai,
      }
      console.log('Payload being sent to server:', payload)

      if (idchinh) {
        await apiClient.put(`/lichlamviec/${idchinh}`, payload)
        success('Cập nhật lịch làm việc thành công')
      } else {
        await apiClient.post('/lichlamviec', payload)
        success('Tạo lịch làm việc thành công')
      }

      setDuLieuForm({
        bacSiId: '',
        ngayLamViec: '',
        caLam: '',
        gioBatDau: '',
        gioKetThuc: '',
        soBenhNhanToiDa: '10',
        trangThai: 'HoatDong',
      })
      setLoiSuForm({})
      setIdChinh(null)
      setMoForm(false)
      laydulieu()
    } catch (err) {
      console.error('Error:', err.response?.data)
      const errorMessage = err.response?.data?.message || 'Lỗi khi lưu lịch làm việc'
      showError(errorMessage)
    } finally {
      setDangGuiChiTieuThuCDung(false)
    }
  }

  const xulyChinhsua = (lichlamviec) => {
    setDuLieuForm({
      bacSiId: lichlamviec.BacSiId || '',
      ngayLamViec: lichlamviec.NgayLamViec ? lichlamviec.NgayLamViec.split('T')[0] : '',
      caLam: lichlamviec.CaLam || '',
      gioBatDau: lichlamviec.GioBatDau || '',
      gioKetThuc: lichlamviec.GioKetThuc || '',
      soBenhNhanToiDa: lichlamviec.SoBenhNhanToiDa || '10',
      trangThai: lichlamviec.TrangThai || 'HoatDong',
    })
    setLoiSuForm({})
    setIdChinh(lichlamviec.LichLamViecId)
    setMoForm(true)
  }

  // Check if BacSi can edit this schedule
  const coTheChinhsua = (lichlamviec) => {
    if (!nguoidunghientai) return true
    if (nguoidunghientai.VaiTro !== 'BacSi') return true
    // BacSi can only edit their own schedule
    return bacsihientai && bacsihientai.BacSiId === lichlamviec.BacSiId
  }

  const xulyXoa = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa lịch làm việc này?')) return

    try {
      await apiClient.delete(`/lichlamviec/${id}`)
      success('Xóa lịch làm việc thành công')
      laydulieu()
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể xóa lịch làm việc'
      showError(errorMsg)
      console.error(err)
    }
  }

  // Check if BacSi can delete this schedule
  const coTheXoa = (lichlamviec) => {
    if (!nguoidunghientai) return true
    if (nguoidunghientai.VaiTro !== 'BacSi') return true
    // BacSi can only delete their own schedule
    return bacsihientai && bacsihientai.BacSiId === lichlamviec.BacSiId
  }

  const xulyHuy = () => {
    setMoForm(false)
    setIdChinh(null)
    setDuLieuForm({
      bacSiId: '',
      ngayLamViec: '',
      caLam: '',
      gioBatDau: '',
      gioKetThuc: '',
      soBenhNhanToiDa: '10',
      trangThai: 'HoatDong',
    })
    setLoiSuForm({})
    setTimKiemTenBacSi('')
    setLocTheoBacSiId('')
    setLocTheoCalama('')
    setLocTheoTrangThai('')
    setLocTheoNgayLamViec('')
  }

  const layTenBacSi = (bacSiId) => {
    const bacsi = danhsachbacsi.find(d => d.BacSiId === bacSiId)
    return bacsi?.NguoiDung?.HoTen || `Bác sĩ #${bacSiId}`
  }

  const danhsachlichlamviecdaloc = danhsachlichlamviec.filter(s => {
    // Filter by doctor ID dropdown
    if (loctheobacsiid && s.BacSiId !== parseInt(loctheobacsiid)) {
      return false
    }
    
    // Filter by doctor name search
    if (timkiemtenbacsi) {
      const tenBacSi = layTenBacSi(s.BacSiId).toLowerCase()
      const tieuChiTimKiem = timkiemtenbacsi.toLowerCase()
      if (!tenBacSi.includes(tieuChiTimKiem)) {
        return false
      }
    }

    // Filter by shift (Ca Làm)
    if (locthecalma && s.CaLam !== locthecalma) {
      return false
    }

    // Filter by status (Trạng Thái)
    if (loctheotrangthai && s.TrangThai !== loctheotrangthai) {
      return false
    }

    // Filter by date (Ngày Làm Việc)
    if (loctheonaylamviec) {
      const lichlamviecdate = s.NgayLamViec ? s.NgayLamViec.split('T')[0] : ''
      if (lichlamviecdate !== loctheonaylamviec) {
        return false
      }
    }
    
    return true
  })

  useEffect(() => {
    console.log('Filtered schedules count:', danhsachlichlamviecdaloc.length, 'Filters - BacSiId:', loctheobacsiid, 'DoctorName:', timkiemtenbacsi, 'CaLam:', locthecalma, 'TrangThai:', loctheotrangthai, 'NgayLamViec:', loctheonaylamviec)
  }, [danhsachlichlamviecdaloc, loctheobacsiid, timkiemtenbacsi, locthecalma, loctheotrangthai, loctheonaylamviec, moform])

  const layNhanTrangThai = (status) => {
    return status === 'HoatDong' ? 'Hoạt động' : 'Hủy'
  }

  if (dangta) return <div className="loading">Đang tải...</div>

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>Lịch Làm Việc Bác Sĩ</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setMoForm(true)
            setLoiSuForm({})
          }}
          disabled={moform}
        >
          Thêm lịch làm việc
        </button>
      </div>

      {moform && (
        <div className="form-container">
          <h2>{idchinh ? 'Sửa lịch làm việc' : 'Thêm lịch làm việc mới'}</h2>
          <form onSubmit={xulyGuiForm}>
            <div className="form-row">
              <div className="form-group">
                <label>Bác sĩ *</label>
                {nguoidunghientai?.VaiTro === 'BacSi' ? (
                  <div style={{ 
                    padding: '10px 12px', 
                    backgroundColor: '#e3f2fd', 
                    borderRadius: '4px',
                    border: '1px solid #90caf9',
                    fontWeight: '500',
                    fontSize: '16px'
                  }}>
                    {bacsihientai?.NguoiDung?.HoTen || nguoidunghientai?.HoTen} {bacsihientai?.ChuyenKhoaId && `(${bacsihientai.ChuyenKhoaId})`}
                  </div>
                ) : (
                  <select
                    name="bacSiId"
                    value={dulieuform.bacSiId}
                    onChange={xulyThayDoiInput}
                    required
                  >
                    <option value="">-- Chọn bác sĩ --</option>
                    {danhsachbacsi.map(bacsi => (
                      <option key={bacsi.BacSiId} value={bacsi.BacSiId}>
                        {bacsi.NguoiDung?.HoTen} - {bacsi.ChuyenKhoaId}
                      </option>
                    ))}
                  </select>
                )}
                {loisuform.bacSiId && <span className="field-error">{loisuform.bacSiId}</span>}
              </div>

              <div className="form-group">
                <label>Ngày làm việc *</label>
                <input
                  type="date"
                  name="ngayLamViec"
                  value={dulieuform.ngayLamViec}
                  onChange={xulyThayDoiInput}
                  required
                />
                {loisuform.ngayLamViec && <span className="field-error">{loisuform.ngayLamViec}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ca làm *</label>
                <select
                  name="caLam"
                  value={dulieuform.caLam}
                  onChange={xulyThayDoiInput}
                  required
                >
                  <option value="">-- Chọn ca --</option>
                  <option value="Sang">Sáng (08:00-12:00)</option>
                  <option value="Chieu">Chiều (14:00-17:00)</option>
                  <option value="Toi">Tối (19:00-21:00)</option>
                </select>
                {loisuform.caLam && <span className="field-error">{loisuform.caLam}</span>}
              </div>

              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  name="trangThai"
                  value={dulieuform.trangThai}
                  onChange={xulyThayDoiInput}
                >
                  <option value="HoatDong">Hoạt động</option>
                  <option value="Huy">Hủy</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Giờ bắt đầu *</label>
                <input
                  type="time"
                  name="gioBatDau"
                  value={dulieuform.gioBatDau}
                  onChange={xulyThayDoiInput}
                  required
                />
                {loisuform.gioBatDau && <span className="field-error">{loisuform.gioBatDau}</span>}
              </div>

              <div className="form-group">
                <label>Giờ kết thúc *</label>
                <input
                  type="time"
                  name="gioKetThuc"
                  value={dulieuform.gioKetThuc}
                  onChange={xulyThayDoiInput}
                  required
                />
                {loisuform.gioKetThuc && <span className="field-error">{loisuform.gioKetThuc}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Số bệnh nhân tối đa *</label>
                <input
                  type="number"
                  name="soBenhNhanToiDa"
                  value={dulieuform.soBenhNhanToiDa}
                  onChange={xulyThayDoiInput}
                  min="1"
                  required
                />
                {loisuform.soBenhNhanToiDa && <span className="field-error">{loisuform.soBenhNhanToiDa}</span>}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={dangguichitieuthucdung}>
                {dangguichitieuthucdung ? 'Đang lưu...' : idchinh ? 'Cập nhật' : 'Tạo mới'}
              </button>
              <button type="button" className="btn-secondary" onClick={xulyHuy} disabled={dangguichitieuthucdung}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="filter-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên bác sĩ..."
            value={timkiemtenbacsi}
            onChange={(e) => setTimKiemTenBacSi(e.target.value)}
            style={{ 
              width: '100%',
              padding: '8px 12px', 
              borderRadius: '4px', 
              border: '1px solid #ddd',
              fontSize: '14px'
            }}
          />
        </div>

        <select
          value={loctheobacsiid}
          onChange={(e) => setLocTheoBacSiId(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '180px' }}
        >
          <option value="">-- Tất cả bác sĩ --</option>
          {danhsachbacsi.map(bacsi => (
            <option key={bacsi.BacSiId} value={bacsi.BacSiId}>
              {bacsi.NguoiDung?.HoTen}
            </option>
          ))}
        </select>

        <select
          value={locthecalma}
          onChange={(e) => setLocTheoCalama(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '140px' }}
        >
          <option value="">-- Tất cả ca --</option>
          <option value="Sang">Sáng</option>
          <option value="Chieu">Chiều</option>
          <option value="Toi">Tối</option>
        </select>

        <select
          value={loctheotrangthai}
          onChange={(e) => setLocTheoTrangThai(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '150px' }}
        >
          <option value="">-- Tất cả trạng thái --</option>
          <option value="HoatDong">Hoạt động</option>
          <option value="Huy">Hủy</option>
        </select>

        <input
          type="date"
          value={loctheonaylamviec}
          onChange={(e) => setLocTheoNgayLamViec(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '150px' }}
        />

        {(timkiemtenbacsi || loctheobacsiid || locthecalma || loctheotrangthai || loctheonaylamviec) && (
          <button
            onClick={() => {
              setTimKiemTenBacSi('')
              setLocTheoBacSiId('')
              setLocTheoCalama('')
              setLocTheoTrangThai('')
              setLocTheoNgayLamViec('')
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              background: '#f5f5f5',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      <div style={{ marginBottom: '10px', color: '#666', fontSize: '14px' }}>
        Tìm thấy <strong>{danhsachlichlamviecdaloc.length}</strong> lịch làm việc
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Mã Lịch</th>
              <th>Bác Sĩ</th>
              <th>Ngày</th>
              <th>Ca Làm</th>
              <th>Giờ</th>
              <th>Bệnh nhân tối đa</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {danhsachlichlamviecdaloc.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">
                  Chưa có lịch làm việc
                </td>
              </tr>
            ) : (
              danhsachlichlamviecdaloc.map((lichlamviec) => (
                <tr key={lichlamviec.LichLamViecId}>
                  <td>{lichlamviec.LichLamViecId}</td>
                  <td>{layTenBacSi(lichlamviec.BacSiId)}</td>
                  <td>{new Date(lichlamviec.NgayLamViec).toLocaleDateString('vi-VN')}</td>
                  <td>{lichlamviec.CaLam === 'Sang' ? 'Sáng' : lichlamviec.CaLam === 'Chieu' ? 'Chiều' : 'Tối'}</td>
                  <td>{lichlamviec.GioBatDau} - {lichlamviec.GioKetThuc}</td>
                  <td>{lichlamviec.SoBenhNhanToiDa}</td>
                  <td>
                    <span className={lichlamviec.TrangThai === 'HoatDong' ? 'badge badge-success' : 'badge badge-danger'}>
                      {layNhanTrangThai(lichlamviec.TrangThai)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-edit btn-success"
                      onClick={() => xulyChinhsua(lichlamviec)}
                      disabled={moform || !coTheChinhsua(lichlamviec)}
                      title={!coTheChinhsua(lichlamviec) ? 'Bạn không có quyền sửa lịch làm việc của đồng nghiệp' : 'Cập nhật'}
                    >
                      Cập nhật
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => xulyXoa(lichlamviec.LichLamViecId)}
                      disabled={moform || !coTheXoa(lichlamviec)}
                      title={!coTheXoa(lichlamviec) ? 'Bạn không có quyền xóa lịch làm việc của đồng nghiệp' : 'Xóa'}
                    >
                      Xóa
                    </button>
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
