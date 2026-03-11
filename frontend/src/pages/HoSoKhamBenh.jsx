import { useState, useEffect, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import apiClient from '../services/api'
import { ToastContext } from '../context/ToastContext'
import { AuthContext } from '../context/AuthContext'
import '../styles/list.css'

export default function HoSoKhamBenh() {
  const location = useLocation()
  const navigate = useNavigate()
  const { success, error: showError } = useContext(ToastContext)
  const { user } = useContext(AuthContext)

  const [danhsachHoSo, setDanhSachHoSo] = useState([])
  const [danhsachLichKham, setDanhSachLichKham] = useState([])
  const [danhsachBenhNhan, setDanhSachBenhNhan] = useState([])
  const [dangTai, setDangTai] = useState(true)
  const [dangGui, setDangGui] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Form thêm lần khám (LanKham)
  const [moFormLanKham, setMoFormLanKham] = useState(false)
  const [hoSoDangChon, setHoSoDangChon] = useState(null) // HoSo đang thêm lần khám
  const [idLanKhamChinhSua, setIdLanKhamChinhSua] = useState(null)
  const [formLanKham, setFormLanKham] = useState({ lichKhamId: '', trieuChung: '', chanDoan: '', keHoachDieuTri: '', ketLuan: '', ghiChu: '' })
  const [loiFormLanKham, setLoiFormLanKham] = useState({})
  const [tuLuongLichKhamId, setTuLuongLichKhamId] = useState(null)

  // Form tạo hồ sơ mới
  const [moFormTaoHoSo, setMoFormTaoHoSo] = useState(false)
  const [formTaoHoSo, setFormTaoHoSo] = useState({ benhNhanId: '', ghiChu: '' })

  // Modal xem lịch sử lần khám
  const [hoSoXemLichSu, setHoSoXemLichSu] = useState(null)

  const coTheTao = user?.role === 'BacSi' || user?.role === 'QuanTri' || user?.role === 'QuanLy'
  const coTheXem = ['BacSi', 'QuanTri', 'QuanLy', 'LeTan'].includes(user?.role)

  useEffect(() => {
    layDuLieu()
  }, [])

  // Xử lý điều hướng từ LichKhamCuaToi
  useEffect(() => {
    const state = location.state
    if (!state) return
    window.history.replaceState({}, document.title)

    if (state.hoSoId) {
      // Tìm HoSo từ danh sách và mở form thêm lần khám
      const doAfterLoad = async () => {
        try {
          const res = await apiClient.get(`/hosokhambenh/${state.hoSoId}`)
          const hoSo = res.data.data
          setHoSoDangChon(hoSo)
          setFormLanKham(prev => ({ ...prev, lichKhamId: state.lichKhamId?.toString() || '' }))
          if (state.lichKhamId) setTuLuongLichKhamId(state.lichKhamId)
          setMoFormLanKham(true)
        } catch { /* ignore */ }
      }
      doAfterLoad()
    }
  }, [location.state?.hoSoId])

  const layDuLieu = async () => {
    try {
      setDangTai(true)
      const [hosoRes, lichkhamRes, benhnhanRes] = await Promise.all([
        apiClient.get('/hosokhambenh?limit=1000'),
        apiClient.get('/lichkham?limit=1000'),
        apiClient.get('/benhnhan?limit=1000'),
      ])
      setDanhSachHoSo(hosoRes.data.data || [])
      setDanhSachLichKham(lichkhamRes.data.data || [])
      setDanhSachBenhNhan(benhnhanRes.data.data || [])
    } catch (err) {
      showError('Không thể tải dữ liệu')
    } finally {
      setDangTai(false)
    }
  }

  // ─── TẠO HỒ SƠ MỚI ────────────────────────────────────────────────────────
  const xulyTaoHoSo = async (e) => {
    e.preventDefault()
    if (!formTaoHoSo.benhNhanId) {
      showError('Vui lòng chọn bệnh nhân')
      return
    }
    try {
      setDangGui(true)
      await apiClient.post('/hosokhambenh', { benhNhanId: parseInt(formTaoHoSo.benhNhanId), ghiChu: formTaoHoSo.ghiChu || null })
      success('Tạo hồ sơ thành công')
      setMoFormTaoHoSo(false)
      setFormTaoHoSo({ benhNhanId: '', ghiChu: '' })
      layDuLieu()
    } catch (err) {
      if (err.response?.status === 409 && err.response.data?.existingHoSoId) {
        showError('Bệnh nhân này đã có hồ sơ')
      } else {
        showError(err.response?.data?.message || 'Lỗi khi tạo hồ sơ')
      }
    } finally {
      setDangGui(false)
    }
  }

  // ─── THÊM / SỬA LẦN KHÁM ──────────────────────────────────────────────────
  const moThemLanKham = (hoSo) => {
    setHoSoDangChon(hoSo)
    setFormLanKham({ lichKhamId: '', trieuChung: '', chanDoan: '', keHoachDieuTri: '', ketLuan: '', ghiChu: '' })
    setLoiFormLanKham({})
    setIdLanKhamChinhSua(null)
    setMoFormLanKham(true)
    setHoSoXemLichSu(null)
  }

  const moChinhSuaLanKham = (hoSo, lanKham) => {
    setHoSoDangChon(hoSo)
    setFormLanKham({
      lichKhamId: lanKham.LichKhamId?.toString() || '',
      trieuChung: lanKham.TrieuChung || '',
      chanDoan: lanKham.ChanDoan || '',
      keHoachDieuTri: lanKham.KeHoachDieuTri || '',
      ketLuan: lanKham.KetLuan || '',
      ghiChu: lanKham.GhiChu || '',
    })
    setLoiFormLanKham({})
    setIdLanKhamChinhSua(lanKham.LanKhamId)
    setMoFormLanKham(true)
    setHoSoXemLichSu(null)
  }

  const xulyLuuLanKham = async (e) => {
    e.preventDefault()
    const loi = {}
    if (!formLanKham.trieuChung) loi.trieuChung = 'Triệu chứng không được để trống'
    if (!formLanKham.chanDoan) loi.chanDoan = 'Chẩn đoán không được để trống'
    if (Object.keys(loi).length > 0) {
      setLoiFormLanKham(loi)
      return
    }

    try {
      setDangGui(true)
      if (idLanKhamChinhSua) {
        // Cập nhật lần khám
        await apiClient.put(`/lankham/${idLanKhamChinhSua}`, {
          trieuChung: formLanKham.trieuChung,
          chanDoan: formLanKham.chanDoan,
          keHoachDieuTri: formLanKham.keHoachDieuTri || null,
          ketLuan: formLanKham.ketLuan || null,
          ghiChu: formLanKham.ghiChu || null,
        })
        success('Cập nhật lần khám thành công')
        setMoFormLanKham(false)
        setIdLanKhamChinhSua(null)
        layDuLieu()
      } else {
        // Tạo lần khám mới
        const res = await apiClient.post('/lankham', {
          hoSoId: hoSoDangChon.HoSoId,
          lichKhamId: formLanKham.lichKhamId ? parseInt(formLanKham.lichKhamId) : null,
          trieuChung: formLanKham.trieuChung,
          chanDoan: formLanKham.chanDoan,
          keHoachDieuTri: formLanKham.keHoachDieuTri || null,
          ketLuan: formLanKham.ketLuan || null,
          ghiChu: formLanKham.ghiChu || null,
        })
        success('Thêm lần khám thành công')
        const newLanKhamId = res.data.data?.LanKhamId
        setMoFormLanKham(false)
        setFormLanKham({ lichKhamId: '', trieuChung: '', chanDoan: '', keHoachDieuTri: '', ketLuan: '', ghiChu: '' })
        // Nếu từ luồng LichKhamCuaToi → chuyển sang tạo đơn thuốc
        if (tuLuongLichKhamId && newLanKhamId) {
          setTuLuongLichKhamId(null)
          navigate('/prescriptions', { state: { lanKhamId: newLanKhamId, fromWorkflow: true } })
        } else {
          layDuLieu()
        }
      }
    } catch (err) {
      if (err.response?.status === 409 && err.response.data?.existingLanKhamId) {
        showError('Lịch khám này đã có lần khám. Vui lòng chọn lịch khám khác.')
      } else {
        showError(err.response?.data?.message || 'Lỗi khi lưu lần khám')
      }
    } finally {
      setDangGui(false)
    }
  }

  const xulyXoaLanKham = async (lanKhamId) => {
    if (!window.confirm('Bạn có chắc muốn xóa lần khám này?')) return
    try {
      await apiClient.delete(`/lankham/${lanKhamId}`)
      success('Xóa lần khám thành công')
      // Refresh HoSo đang xem
      if (hoSoXemLichSu) {
        const res = await apiClient.get(`/hosokhambenh/${hoSoXemLichSu.HoSoId}`)
        setHoSoXemLichSu(res.data.data)
      }
      layDuLieu()
    } catch {
      showError('Không thể xóa lần khám')
    }
  }

  const xulyXoaHoSo = async (hoSoId) => {
    if (!window.confirm('Xóa hồ sơ sẽ xóa toàn bộ lịch sử khám. Bạn chắc chắn?')) return
    try {
      await apiClient.delete(`/hosokhambenh/${hoSoId}`)
      success('Xóa hồ sơ thành công')
      layDuLieu()
    } catch {
      showError('Không thể xóa hồ sơ')
    }
  }

  const huyFormLanKham = () => {
    setMoFormLanKham(false)
    setHoSoDangChon(null)
    setIdLanKhamChinhSua(null)
    setTuLuongLichKhamId(null)
    setFormLanKham({ lichKhamId: '', trieuChung: '', chanDoan: '', keHoachDieuTri: '', ketLuan: '', ghiChu: '' })
    setLoiFormLanKham({})
  }

  const lichKhamCoTheDung = danhsachLichKham.filter(lk =>
    lk.TrangThai === 'DaXacNhan' || lk.TrangThai === 'DangKham' || lk.TrangThai === 'DaKham'
  )

  const danhSachLoc = danhsachHoSo.filter(hs => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      hs.BenhNhan?.HoTen?.toLowerCase().includes(term) ||
      hs.BenhNhan?.MaBenhNhan?.toLowerCase().includes(term) ||
      hs.MaHoSo?.toLowerCase().includes(term)
    )
  })

  if (dangTai) return <div className="loading">Đang tải...</div>

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>Hồ Sơ Khám Bệnh</h1>
        {coTheTao && (
          <button className="btn-primary" onClick={() => { setMoFormTaoHoSo(true); setMoFormLanKham(false) }} disabled={moFormTaoHoSo}>
            + Tạo Hồ Sơ Mới
          </button>
        )}
      </div>

      {/* ── Form tạo hồ sơ mới ── */}
      {moFormTaoHoSo && coTheTao && (
        <div className="form-card">
          <div className="form-header">
            <h2>Tạo Hồ Sơ Bệnh Nhân Mới</h2>
          </div>
          <form onSubmit={xulyTaoHoSo} className="medical-form">
            <div className="form-group">
              <label>Bệnh nhân *</label>
              <select value={formTaoHoSo.benhNhanId} onChange={e => setFormTaoHoSo(p => ({ ...p, benhNhanId: e.target.value }))} required>
                <option value="">-- Chọn bệnh nhân --</option>
                {danhsachBenhNhan
                  .filter(bn => !danhsachHoSo.some(hs => hs.BenhNhanId === bn.BenhNhanId))
                  .map(bn => (
                    <option key={bn.BenhNhanId} value={bn.BenhNhanId}>{bn.HoTen} ({bn.MaBenhNhan})</option>
                  ))}
              </select>
            </div>
            <div className="form-group">
              <label>Ghi chú</label>
              <textarea value={formTaoHoSo.ghiChu} onChange={e => setFormTaoHoSo(p => ({ ...p, ghiChu: e.target.value }))} rows="2" />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={dangGui}>{dangGui ? 'Đang tạo...' : 'Tạo Hồ Sơ'}</button>
              <button type="button" className="btn-secondary" onClick={() => setMoFormTaoHoSo(false)}>Hủy</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Form thêm / sửa lần khám ── */}
      {moFormLanKham && hoSoDangChon && coTheTao && (
        <div className="form-card">
          <div className="form-header">
            <h2>{idLanKhamChinhSua ? 'Cập Nhật Lần Khám' : 'Thêm Lần Khám Mới'}</h2>
            <p className="form-subtitle">
              Hồ sơ: <strong>{hoSoDangChon.MaHoSo}</strong> — Bệnh nhân: <strong>{hoSoDangChon.BenhNhan?.HoTen}</strong>
            </p>
          </div>
          <form onSubmit={xulyLuuLanKham} className="medical-form">
            <div className="form-group">
              <label>Lịch khám liên quan</label>
              <select value={formLanKham.lichKhamId} onChange={e => setFormLanKham(p => ({ ...p, lichKhamId: e.target.value }))}>
                <option value="">-- Không liên kết lịch khám --</option>
                {lichKhamCoTheDung
                  .filter(lk => lk.BenhNhanId === hoSoDangChon.BenhNhanId)
                  .map(lk => (
                    <option key={lk.LichKhamId} value={lk.LichKhamId}>
                      {lk.MaLichKham} — {new Date(lk.ThoiGianBatDau).toLocaleString('vi-VN')}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Triệu chứng *</label>
                <textarea name="trieuChung" value={formLanKham.trieuChung} onChange={e => setFormLanKham(p => ({ ...p, trieuChung: e.target.value }))} rows="3" placeholder="Nhập triệu chứng" />
                {loiFormLanKham.trieuChung && <span className="field-error">{loiFormLanKham.trieuChung}</span>}
              </div>
              <div className="form-group">
                <label>Chẩn đoán *</label>
                <textarea name="chanDoan" value={formLanKham.chanDoan} onChange={e => setFormLanKham(p => ({ ...p, chanDoan: e.target.value }))} rows="3" placeholder="Nhập chẩn đoán" />
                {loiFormLanKham.chanDoan && <span className="field-error">{loiFormLanKham.chanDoan}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Kế hoạch điều trị</label>
                <textarea value={formLanKham.keHoachDieuTri} onChange={e => setFormLanKham(p => ({ ...p, keHoachDieuTri: e.target.value }))} rows="3" placeholder="Nhập kế hoạch điều trị" />
              </div>
              <div className="form-group">
                <label>Kết luận</label>
                <textarea value={formLanKham.ketLuan} onChange={e => setFormLanKham(p => ({ ...p, ketLuan: e.target.value }))} rows="3" placeholder="Nhập kết luận" />
              </div>
            </div>
            <div className="form-group">
              <label>Ghi chú</label>
              <textarea value={formLanKham.ghiChu} onChange={e => setFormLanKham(p => ({ ...p, ghiChu: e.target.value }))} rows="2" placeholder="Nhập ghi chú" />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={dangGui}>{dangGui ? 'Đang lưu...' : (idLanKhamChinhSua ? 'Cập nhật' : 'Lưu lần khám')}</button>
              <button type="button" className="btn-secondary" onClick={huyFormLanKham}>Hủy</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Thanh tìm kiếm ── */}
      <div className="search-bar" style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Tìm theo tên bệnh nhân, mã bệnh nhân, mã hồ sơ..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '10px 15px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>

      {/* ── Bảng danh sách hồ sơ ── */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Mã Hồ Sơ</th>
              <th>Bệnh Nhân</th>
              <th>Số Lần Khám</th>
              <th>Lần Khám Gần Nhất</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {danhSachLoc.length === 0 ? (
              <tr><td colSpan="5" className="text-center">{searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có hồ sơ nào'}</td></tr>
            ) : (
              danhSachLoc.map(hoSo => {
                const soLanKham = hoSo.LanKhams?.length || 0
                const lanKhamMoiNhat = hoSo.LanKhams?.[0]
                return (
                  <tr key={hoSo.HoSoId}>
                    <td><strong>{hoSo.MaHoSo}</strong></td>
                    <td>
                      <div>{hoSo.BenhNhan?.HoTen}</div>
                      <small style={{ color: '#666' }}>{hoSo.BenhNhan?.MaBenhNhan}</small>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: '#e3f2fd', color: '#1565c0', padding: '2px 10px', borderRadius: '12px', fontWeight: 600 }}>
                        {soLanKham} lần
                      </span>
                    </td>
                    <td>
                      {lanKhamMoiNhat ? (
                        <div>
                          <div style={{ fontWeight: 500 }}>{lanKhamMoiNhat.ChanDoan?.substring(0, 40)}{lanKhamMoiNhat.ChanDoan?.length > 40 ? '...' : ''}</div>
                          <small style={{ color: '#666' }}>{new Date(lanKhamMoiNhat.NgayKham).toLocaleDateString('vi-VN')}</small>
                        </div>
                      ) : <span style={{ color: '#999' }}>Chưa có</span>}
                    </td>
                    <td className="actions">
                      {coTheXem && (
                        <button className="btn-small btn-info" onClick={() => setHoSoXemLichSu(hoSo)}>
                          Lịch sử
                        </button>
                      )}
                      {coTheTao && (
                        <button className="btn-small btn-primary" onClick={() => moThemLanKham(hoSo)}>
                          + Lần khám
                        </button>
                      )}
                      {coTheTao && (
                        <button className="btn-small btn-delete" onClick={() => xulyXoaHoSo(hoSo.HoSoId)}>
                          Xóa
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modal lịch sử khám ── */}
      {hoSoXemLichSu && (
        <div className="modal-overlay" onClick={() => setHoSoXemLichSu(null)}>
          <div className="modal-content" style={{ maxWidth: '900px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Lịch Sử Khám — {hoSoXemLichSu.BenhNhan?.HoTen} ({hoSoXemLichSu.MaHoSo})</h2>
              <button className="modal-close" onClick={() => setHoSoXemLichSu(null)}>×</button>
            </div>
            <div className="modal-body">
              {hoSoXemLichSu.LanKhams?.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999' }}>Chưa có lần khám nào</p>
              ) : (
                hoSoXemLichSu.LanKhams?.map((lk, idx) => (
                  <div key={lk.LanKhamId} style={{ borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong style={{ color: '#1565c0' }}>Lần {hoSoXemLichSu.LanKhams.length - idx}: {lk.MaLanKham}</strong>
                        <span style={{ marginLeft: '12px', color: '#666', fontSize: '0.9rem' }}>
                          {new Date(lk.NgayKham).toLocaleDateString('vi-VN')}
                          {lk.BacSi?.NguoiDung?.HoTen && ` — BS. ${lk.BacSi.NguoiDung.HoTen}`}
                        </span>
                      </div>
                      {coTheTao && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn-small btn-success" onClick={() => moChinhSuaLanKham(hoSoXemLichSu, lk)}>Sửa</button>
                          <button className="btn-small btn-primary"
                            onClick={() => {
                              setHoSoXemLichSu(null)
                              navigate('/prescriptions', { state: { lanKhamId: lk.LanKhamId, fromWorkflow: false } })
                            }}>
                            {lk.DonThuoc ? 'Xem Đơn Thuốc' : 'Tạo Đơn Thuốc'}
                          </button>
                          <button className="btn-small btn-delete" onClick={() => xulyXoaLanKham(lk.LanKhamId)}>Xóa</button>
                        </div>
                      )}
                    </div>
                    <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div><strong>Triệu chứng:</strong> <span>{lk.TrieuChung}</span></div>
                      <div><strong>Chẩn đoán:</strong> <span>{lk.ChanDoan}</span></div>
                      {lk.KeHoachDieuTri && <div><strong>Kế hoạch:</strong> <span>{lk.KeHoachDieuTri}</span></div>}
                      {lk.KetLuan && <div><strong>Kết luận:</strong> <span>{lk.KetLuan}</span></div>}
                    </div>
                    {lk.DonThuoc && (
                      <div style={{ marginTop: '6px', padding: '8px', background: '#f0f7ff', borderRadius: '4px', fontSize: '0.9rem' }}>
                        <strong>Đơn thuốc {lk.DonThuoc.MaDonThuoc}:</strong>{' '}
                        {lk.DonThuoc.DonThuocChiTiets?.map(ct => ct.TenThuoc).join(', ')}
                      </div>
                    )}
                  </div>
                ))
              )}
              {coTheTao && (
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <button className="btn-primary" onClick={() => moThemLanKham(hoSoXemLichSu)}>
                    + Thêm Lần Khám Mới
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
