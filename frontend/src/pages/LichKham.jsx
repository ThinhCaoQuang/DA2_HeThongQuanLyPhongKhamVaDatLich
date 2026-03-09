import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../services/api'
import { ToastContext } from '../context/ToastContext'
import { AuthContext } from '../context/AuthContext'
import { validateLichKham, hasErrors } from '../utils/validation'
import SpecialtyRecommendation from '../components/SpecialtyRecommendation'
import '../styles/list.css'

export default function LichKham() {
  const navigate = useNavigate()
  const { success, error: showError } = useContext(ToastContext)
  const { user } = useContext(AuthContext)
  const [danhsachlichkham, setDanhSachLichKham] = useState([])
  const [danhsachbenhnhan, setDanhSachBenhNhan] = useState([])
  const [danhsachchuyenkhoa, setDanhSachChuyenKhoa] = useState([])
  const [danhsachbacsi, setDanhSachBacSi] = useState([])
  const [danhsagiovachon, setDanhSachGioVaChon] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [moform, setMoForm] = useState(false)
  const [idchinh, setIdChinh] = useState(null)
  const [dangagibacsi, setDangTaiBacSi] = useState(false)
  const [dangathoigian, setDangTaiThoiGian] = useState(false)
  const [aiStatus, setAiStatus] = useState('') // Track AI recommendation status
  const [dulieuform, setDuLieuForm] = useState({
    benhnhanid: '',
    chuyenkhoanid: '',
    bacsiiid: '',
    thoigianhatdau: '',
    trieuChung: '',
    ghiChu: '',
  })
  const [loisuform, setLoiSuForm] = useState({})

  useEffect(() => {
    laydulieu()
  }, [])

  // Load doctors when specialty changes (for admin and doctors)
  useEffect(() => {
    if (user?.role === 'LeTan') {
      // For LeTan: Load all doctors on form open
      if (moform) {
        taiTatCaBacSi()
      }
    } else {
      // For admin and doctors: Load doctors based on specialty selection
      if (dulieuform.chuyenkhoanid) {
        taibacsitheokhoa(dulieuform.chuyenkhoanid)
      } else {
        setDanhSachBacSi([])
        setDanhSachGioVaChon([])
        setDuLieuForm(prev => ({ ...prev, bacsiiid: '', thoigianhatdau: '' }))
      }
    }
  }, [dulieuform.chuyenkhoanid, moform, user?.role])

  // Load available time slots when doctor changes
  useEffect(() => {
    if (dulieuform.bacsiiid) {
      taihoang(dulieuform.bacsiiid)
    } else {
      setDanhSachGioVaChon([])
      setDuLieuForm(prev => ({ ...prev, thoigianhatdau: '' }))
    }
  }, [dulieuform.bacsiiid])

  const laydulieu = async () => {
    try {
      setLoading(true)
      const [lichkhamRes, benhnhanRes, chuyenkhoaRes] = await Promise.all([
        apiClient.get('/lichkham?limit=1000'),
        apiClient.get('/benhnhan?limit=1000'),
        apiClient.get('/chuyenkhoa'),
      ])
      
      console.log('Lichkham response:', lichkhamRes.data)
      if (lichkhamRes.data.data.length > 0) {
        console.log('First appointment details:', lichkhamRes.data.data[0])
        console.log('First apt BacSi:', lichkhamRes.data.data[0].BacSi)
        console.log('First apt BacSi NguoiDung:', lichkhamRes.data.data[0].BacSi?.NguoiDung)
      }
      
      setDanhSachLichKham(lichkhamRes.data.data)
      setDanhSachBenhNhan(benhnhanRes.data.data)
      setDanhSachChuyenKhoa(chuyenkhoaRes.data.data)
    } catch (err) {
      showError('Không thể tải dữ liệu')
      console.error('Data loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  const taibacsitheokhoa = async (chuyenkhoanid) => {
    try {
      setDangTaiBacSi(true)
      console.log('Fetching doctors for specialty:', chuyenkhoanid)
      const response = await apiClient.get(`/bacsi?chuyenKhoaId=${chuyenkhoanid}`)
      console.log('Doctors response:', response.data)
      const bacsidanhsach = response.data.data || []
      console.log('Doctors list:', bacsidanhsach)
      setDanhSachBacSi(bacsidanhsach)
      setDuLieuForm(prev => ({ ...prev, bacsiiid: '', thoigianhatdau: '' }))
      setDanhSachGioVaChon([])
      if (bacsidanhsach.length === 0) {
        showError('Không tìm thấy bác sĩ cho chuyên khoa này')
      }
    } catch (err) {
      console.error('Error loading doctors:', err)
      console.error('Error response:', err.response?.data)
      console.error('Error details:', err.message)
      setDanhSachBacSi([])
      showError('Lỗi tải danh sách bác sĩ: ' + (err.response?.data?.message || err.message))
    } finally {
      setDangTaiBacSi(false)
    }
  }

  // Load all doctors for LeTan (receptionist)
  const taiTatCaBacSi = async () => {
    try {
      setDangTaiBacSi(true)
      console.log('Fetching all doctors for LeTan')
      const response = await apiClient.get('/bacsi?limit=1000')
      console.log('All doctors response:', response.data)
      const bacsidanhsach = response.data.data || []
      console.log('All doctors list:', bacsidanhsach)
      setDanhSachBacSi(bacsidanhsach)
      if (bacsidanhsach.length === 0) {
        showError('Không tìm thấy bác sĩ nào')
      }
    } catch (err) {
      console.error('Error loading all doctors:', err)
      setDanhSachBacSi([])
      showError('Lỗi tải danh sách bác sĩ')
    } finally {
      setDangTaiBacSi(false)
    }
  }

  const taihoang = async (bacsiiid) => {
    try {
      setDangTaiThoiGian(true)
      const response = await apiClient.get(`/lichlamviec?bacSiId=${bacsiiid}`)
      const thoigian = response.data.data || []
      
      // Convert schedule to available time slots
      const thoigianhochinh = thoigian.flatMap(slot => {
        const date = new Date(slot.NgayLamViec)
        const startTime = slot.GioBatDau ? slot.GioBatDau.substring(0, 5) : '08:00'
        const endTime = slot.GioKetThuc ? slot.GioKetThuc.substring(0, 5) : '17:00'
        
        // Generate 30-minute intervals
        const times = []
        const [hours, mins] = startTime.split(':').map(Number)
        const [endHours, endMins] = endTime.split(':').map(Number)
        let currentTime = hours * 60 + mins
        const endTotalMins = endHours * 60 + endMins
        
        while (currentTime < endTotalMins) {
          const h = Math.floor(currentTime / 60)
          const m = currentTime % 60
          const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
          const dateStr = date.toISOString().split('T')[0]
          times.push({
            label: `${dateStr} ${timeStr}`,
            value: `${dateStr}T${timeStr}:00`
          })
          currentTime += 30
        }
        return times
      })
      
      setDanhSachGioVaChon(thoigianhochinh)
    } catch (err) {
      console.error('Error loading slots:', err)
      setDanhSachGioVaChon([])
    } finally {
      setDangTaiThoiGian(false)
    }
  }

  const xulyThayDoiInput = (e) => {
    const { name, value } = e.target
    setDuLieuForm((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (loisuform[name]) {
      setLoiSuForm((prev) => ({
        ...prev,
        [name]: '',
      }))
    }

    // For LeTan: Auto-fill specialty when doctor is selected
    if (user?.role === 'LeTan' && name === 'bacsiiid' && value) {
      const selectedDoctor = danhsachbacsi.find(d => d.BacSiId === parseInt(value))
      if (selectedDoctor && selectedDoctor.ChuyenKhoaId) {
        setDuLieuForm((prev) => ({
          ...prev,
          chuyenkhoanid: selectedDoctor.ChuyenKhoaId.toString(),
        }))
      }
    }
  }

  const xulyChonChuyenKhoa = (specialty) => {
    setDuLieuForm((prev) => ({
      ...prev,
      chuyenkhoanid: specialty.id.toString(),
    }))
    if (loisuform.chuyenkhoanid) {
      setLoiSuForm((prev) => ({
        ...prev,
        chuyenkhoanid: '',
      }))
    }
  }

  const xulyCapNhatTrangThaiAI = (status) => {
    setAiStatus(status)
  }

  const xulyGuiForm = async (e) => {
    e.preventDefault()
    
    const errors = validateLichKham(dulieuform)
    if (hasErrors(errors)) {
      setLoiSuForm(errors)
      showError('Vui lòng kiểm tra các trường thông tin')
      return
    }

    try {
      setSubmitting(true)
      // Convert camelCase to PascalCase for backend
      const payload = {
        BenhNhanId: parseInt(dulieuform.benhnhanid),
        BacSiId: dulieuform.bacsiiid ? parseInt(dulieuform.bacsiiid) : null,
        ChuyenKhoaId: parseInt(dulieuform.chuyenkhoanid),
        ThoiGianBatDau: dulieuform.thoigianhatdau,
        TrieuChung: dulieuform.trieuChung,
        GhiChu: dulieuform.ghiChu,
      }
      console.log('Sending appointment:', payload)
      
      if (idchinh) {
        await apiClient.put(`/lichkham/${idchinh}`, payload)
        success('Cập nhật lịch khám thành công')
      } else {
        await apiClient.post('/lichkham', payload)
        success('Tạo lịch khám thành công')
      }
      
      setDuLieuForm({ benhnhanid: '', chuyenkhoanid: '', bacsiiid: '', thoigianhatdau: '', trieuChung: '', ghiChu: '' })
      setLoiSuForm({})
      setIdChinh(null)
      setMoForm(false)
      laydulieu()
    } catch (err) {
      console.error('Error response:', err.response?.data)
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi khi lưu lịch khám'
      console.error('Detailed error:', errorMessage)
      showError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const xulyChinhsua = (lichkham) => {
    const dateTime = lichkham.ThoiGianBatDau 
      ? new Date(lichkham.ThoiGianBatDau).toISOString().slice(0, 19)
      : ''
    
    setDuLieuForm({
      benhnhanid: lichkham.BenhNhanId || '',
      chuyenkhoanid: lichkham.ChuyenKhoaId || '',
      bacsiiid: lichkham.BacSiId || '',
      thoigianhatdau: dateTime,
      trieuChung: lichkham.TrieuChung || '',
      ghiChu: lichkham.GhiChu || '',
    })
    setLoiSuForm({})
    setIdChinh(lichkham.LichKhamId)
    setMoForm(true)
    
    // Load doctors and slots if specialty and doctor set
    if (lichkham.ChuyenKhoaId) {
      taibacsitheokhoa(lichkham.ChuyenKhoaId)
      if (lichkham.BacSiId) {
        taihoang(lichkham.BacSiId)
      }
    }
  }

  const xulyXoa = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa lịch khám này?')) return

    try {
      await apiClient.delete(`/lichkham/${id}`)
      success('Xóa lịch khám thành công')
      laydulieu()
    } catch (err) {
      showError('Không thể xóa lịch khám')
    }
  }

  const xulyXacNhan = async (id) => {
    try {
      await apiClient.post(`/lichkham/${id}/confirm`)
      success('Xác nhận lịch khám thành công')
      laydulieu()
    } catch (err) {
      showError('Không thể xác nhận lịch khám')
    }
  }

  const xulyHuyLichKham = async (id) => {
    if (!window.confirm('Bạn có chắc muốn huỷ lịch khám này?')) return

    try {
      await apiClient.post(`/lichkham/${id}/cancel`)
      success('Huỷ lịch khám thành công')
      laydulieu()
    } catch (err) {
      showError('Không thể huỷ lịch khám')
    }
  }

  const xulyTaoHoSo = (lichkhamid) => {
    navigate('/homadichvu', { 
      state: { lichKhamId: lichkhamid } 
    })
  }

  const xulyDongForm = () => {
    setMoForm(false)
    setIdChinh(null)
    setDuLieuForm({ benhnhanid: '', chuyenkhoanid: '', bacsiiid: '', thoigianhatdau: '', trieuChung: '', ghiChu: '' })
    setLoiSuForm({})
    setDanhSachBacSi([])
    setDanhSachGioVaChon([])
  }

  const layTenBenhNhan = (id) => {
    const benhnhan = danhsachbenhnhan.find(p => p.BenhNhanId === parseInt(id))
    return benhnhan ? benhnhan.HoTen : '-'
  }

  const layTenChuyenKhoa = (id) => {
    const chuyenkhoa = danhsachchuyenkhoa.find(s => s.ChuyenKhoaId === parseInt(id))
    return chuyenkhoa ? chuyenkhoa.TenChuyenKhoa : '-'
  }

  const layTenBacSi = (id, lichkham) => {
    if (!id) return '-'
    // Use BacSi object from appointment if available
    if (lichkham?.BacSi?.NguoiDung?.HoTen) {
      return lichkham.BacSi.NguoiDung.HoTen
    }
    // Fallback: check in doctors list
    let bacsidanhsach = danhsachbacsi.find(d => d.BacSiId === parseInt(id))
    if (bacsidanhsach) return bacsidanhsach.NguoiDung?.HoTen || bacsidanhsach.HoTen
    return '-'
  }

  const layBadgeTrangThai = (trangthai) => {
    const trangthaibando = {
      'ChoXacNhan': { label: 'Chờ xác nhận', color: 'warning' },
      'DaXacNhan': { label: 'Đã xác nhận', color: 'success' },
      'DaKham': { label: 'Đã khám', color: 'success' },
      'DaHuy': { label: 'Đã hủy', color: 'danger' },
    }
    const thongtin = trangthaibando[trangthai] || { label: trangthai, color: 'gray' }
    return <span className={`badge badge-${thongtin.color}`}>{thongtin.label}</span>
  }

  // Filter danh sách lịch khám theo từ khóa tìm kiếm
  const danhsachloc = danhsachlichkham.filter(lk => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      lk.BenhNhan?.HoTen?.toLowerCase().includes(term) ||
      lk.BenhNhan?.MaBenhNhan?.toLowerCase().includes(term) ||
      lk.BacSi?.NguoiDung?.HoTen?.toLowerCase().includes(term) ||
      lk.ChuyenKhoa?.TenChuyenKhoa?.toLowerCase().includes(term)
    )
  })

  if (loading) return <div className="loading">Đang tải...</div>

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>Quản Lý Lịch Khám</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn-success"
            onClick={async () => {
              try {
                const response = await apiClient.get('/lichkham/export/excel', {
                  responseType: 'blob'
                });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `LichKham_${new Date().toISOString().split('T')[0]}.xlsx`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                success('Xuất Excel thành công');
              } catch (err) {
                showError('Không thể xuất file Excel');
              }
            }}
          >
            Xuất Excel
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              setMoForm(true)
              setLoiSuForm({})
              // Load all doctors for LeTan when opening form
              if (user?.role === 'LeTan') {
                taiTatCaBacSi()
              }
            }}
            disabled={moform}
          >
            Tạo Lịch Khám Mới
          </button>
        </div>
      </div>

      {!moform && (
        <div className="search-bar" style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên bệnh nhân, mã bệnh nhân, tên bác sĩ, chuyên khoa..."
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
              {idchinh ? 'Cập Nhật Lịch Khám' : 'Tạo Lịch Khám Mới'}
            </h2>
          </div>
          <form onSubmit={xulyGuiForm} className="form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="benhnhanid">Bệnh Nhân *</label>
                <select
                  id="benhnhanid"
                  name="benhnhanid"
                  value={dulieuform.benhnhanid}
                  onChange={xulyThayDoiInput}
                  className={loisuform.benhnhanid ? 'input-error' : ''}
                >
                  <option value="">-- Chọn bệnh nhân --</option>
                  {danhsachbenhnhan.map((benhnhan) => (
                    <option key={benhnhan.BenhNhanId} value={benhnhan.BenhNhanId}>
                      {benhnhan.MaBenhNhan} - {benhnhan.HoTen}
                    </option>
                  ))}
                </select>
                {loisuform.benhnhanid && (
                  <div className="field-error">{loisuform.benhnhanid}</div>
                )}
              </div>
            </div>

            {/* Show specialty section only for non-LeTan users */}
            {user?.role !== 'LeTan' && (
              <>
                {/* AI-powered specialty recommendation component */}
                {dulieuform.benhnhanid && (
                  <SpecialtyRecommendation onSelectSpecialty={xulyChonChuyenKhoa} onStatusChange={xulyCapNhatTrangThaiAI} />
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="chuyenkhoanid">Chuyên Khoa *</label>
                    <select
                      id="chuyenkhoanid"
                      name="chuyenkhoanid"
                      value={dulieuform.chuyenkhoanid}
                      onChange={xulyThayDoiInput}
                      className={loisuform.chuyenkhoanid ? 'input-error' : ''}
                    >
                      <option value="">-- Chọn chuyên khoa --</option>
                      {danhsachchuyenkhoa.map((chuyenkhoa) => (
                        <option key={chuyenkhoa.ChuyenKhoaId} value={chuyenkhoa.ChuyenKhoaId}>
                          {chuyenkhoa.TenChuyenKhoa}
                        </option>
                      ))}
                    </select>
                    {loisuform.chuyenkhoanid && (
                      <div className="field-error">{loisuform.chuyenkhoanid}</div>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bacsiiid">Bác Sĩ{user?.role !== 'LeTan' && ' *'}</label>
                <select
                  id="bacsiiid"
                  name="bacsiiid"
                  value={dulieuform.bacsiiid}
                  onChange={xulyThayDoiInput}
                  disabled={user?.role !== 'LeTan' && !dulieuform.chuyenkhoanid || dangagibacsi}
                  className={loisuform.bacsiiid ? 'input-error' : ''}
                >
                  <option value="">
                    {dangagibacsi ? 'Đang tải...' : '-- Chọn bác sĩ --'}
                  </option>
                  {danhsachbacsi.map((bacsi) => (
                    <option key={bacsi.BacSiId} value={bacsi.BacSiId}>
                      {bacsi.NguoiDung?.HoTen || 'N/A'} {bacsi.ChuyenKhoa && `(${bacsi.ChuyenKhoa.TenChuyenKhoa})`}
                    </option>
                  ))}
                </select>
                {loisuform.bacsiiid && (
                  <div className="field-error">{loisuform.bacsiiid}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="thoigianhatdau">Thời Gian Khám *</label>
                <select
                  id="thoigianhatdau"
                  name="thoigianhatdau"
                  value={dulieuform.thoigianhatdau}
                  onChange={xulyThayDoiInput}
                  disabled={!dulieuform.bacsiiid || dangathoigian}
                  className={loisuform.thoigianhatdau ? 'input-error' : ''}
                >
                  <option value="">
                    {dangathoigian ? 'Đang tải...' : '-- Chọn thời gian --'}
                  </option>
                  {danhsagiovachon.map((slot, idx) => (
                    <option key={idx} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
                {loisuform.thoigianhatdau && (
                  <div className="field-error">{loisuform.thoigianhatdau}</div>
                )}
              </div>
            </div>

            {/* Show manual symptom field only if AI failed or is not active */}
            {aiStatus !== 'success' && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="trieuChung">Triệu Chứng</label>
                  <textarea
                    id="trieuChung"
                    name="trieuChung"
                    value={dulieuform.trieuChung}
                    onChange={xulyThayDoiInput}
                    rows="3"
                    className={loisuform.trieuChung ? 'input-error' : ''}
                    placeholder="Mô tả triệu chứng (nếu có)"
                  />
                  {loisuform.trieuChung && (
                    <div className="field-error">{loisuform.trieuChung}</div>
                  )}
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ghiChu">Ghi Chú</label>
                <textarea
                  id="ghiChu"
                  name="ghiChu"
                  value={dulieuform.ghiChu}
                  onChange={xulyThayDoiInput}
                  rows="2"
                  placeholder="Ghi chú thêm (nếu có)"
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Đang lưu...' : (idchinh ? 'Cập Nhật' : 'Tạo Mới')}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={xulyDongForm}
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
              <th>Mã Lịch</th>
              <th>Bệnh Nhân</th>
              <th>Chuyên Khoa</th>
              <th>Bác Sĩ</th>
              <th>Thời Gian</th>
              <th>Triệu Chứng</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {danhsachloc.length > 0 ? (
              danhsachloc.map((lichkham) => (
                <tr key={lichkham.LichKhamId}>
                  <td>{lichkham.MaLichKham}</td>
                  <td>{layTenBenhNhan(lichkham.BenhNhanId)}</td>
                  <td>{layTenChuyenKhoa(lichkham.ChuyenKhoaId)}</td>
                  <td>{layTenBacSi(lichkham.BacSiId, lichkham)}</td>
                  <td>{new Date(lichkham.ThoiGianBatDau).toLocaleString('vi-VN')}</td>
                  <td>{lichkham.TrieuChung || '-'}</td>
                  <td>{layBadgeTrangThai(lichkham.TrangThai)}</td>
                  <td className="actions">
                    {lichkham.TrangThai === 'ChoXacNhan' && (
                      <>
                        <button
                          className="btn-small btn-success"
                          onClick={() => xulyXacNhan(lichkham.LichKhamId)}
                        >
                          Xác Nhận
                        </button>
                        <button
                          className="btn-small btn-warning"
                          onClick={() => xulyHuyLichKham(lichkham.LichKhamId)}
                        >
                          Huỷ
                        </button>
                      </>
                    )}
                    {lichkham.TrangThai !== 'ChoXacNhan' && (
                      <>
                        {lichkham.TrangThai === 'DaXacNhan' && (
                          <button
                            className="btn-small btn-primary"
                            onClick={() => xulyTaoHoSo(lichkham.LichKhamId)}
                          >
                            Tạo Hồ Sơ
                          </button>
                        )}
                        <button
                          className="btn-small btn-success"
                          onClick={() => xulyChinhsua(lichkham)}
                          disabled={lichkham.TrangThai === 'DaKham'}
                          title={lichkham.TrangThai === 'DaKham' ? 'Không thể sửa lịch đã khám' : ''}
                        >
                          Cập nhật
                        </button>
                        {lichkham.TrangThai !== 'DaKham' && (
                          <button
                            className="btn-small btn-danger"
                            onClick={() => xulyXoa(lichkham.LichKhamId)}
                          >
                            Xóa
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">
                  {searchTerm ? 'Không tìm thấy lịch khám nào' : 'Không có lịch khám nào'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        .badge-success { background-color: #d4edda; color: #155724; }
        .badge-warning { background-color: #fff3cd; color: #856404; }
        .badge-danger { background-color: #f8d7da; color: #721c24; }
        .badge-gray { background-color: #e2e3e5; color: #383d41; }
      `}</style>
    </div>
  )
}
