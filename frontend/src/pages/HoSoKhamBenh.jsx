import { useState, useEffect, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import apiClient from '../services/api'
import { ToastContext } from '../context/ToastContext'
import { AuthContext } from '../context/AuthContext'
import { validateMedicalRecord, hasErrors } from '../utils/validation'
import '../styles/list.css'

export default function HoSoKhamBenh() {
  const location = useLocation()
  const { success, error: showError } = useContext(ToastContext)
  const { user } = useContext(AuthContext)
  const [danhsachboso, setDanhSachBoSo] = useState([])
  const [dangta, setDangTa] = useState(true)
  const [dangguichitieuthucdung, setDangGuiChiTieuThuCDung] = useState(false)
  const [moform, setMoForm] = useState(false)
  const [mochiTiet, setMoChiTiet] = useState(false)
  const [baodangxem, setBaoDangXem] = useState(null)
  const [idchinh, setIdChinh] = useState(null)
  const [dulieuform, setDuLieuForm] = useState({
    lichKhamId: '',
    trieuChung: '',
    chanDoan: '',
    keHoachDieuTri: '',
    ketLuan: '',
    ghiChu: '',
  })
  const [loisuform, setLoiSuForm] = useState({})
  const [danhsachlichkham, setDanhSachLichKham] = useState([])

  // Check if user is doctor or admin
  const coTheTao = user?.role === 'BacSi' || user?.role === 'QuanTri'
  const coTheXem = user?.role === 'BacSi' || user?.role === 'QuanTri' || user?.role === 'LeTan'

  useEffect(() => {
    laydulieu()
  }, [])

  useEffect(() => {
    // Pre-fill form if navigating from LichKhamCuaToi
    if (location.state?.lichKhamId) {
      setDuLieuForm(prev => ({
        ...prev,
        lichKhamId: location.state.lichKhamId.toString()
      }))
      setMoForm(true)
      // Clear the state so it doesn't persist on page reload
      window.history.replaceState({}, document.title)
    }
  }, [location.state?.lichKhamId])

  const laydulieu = async () => {
    try {
      setDangTa(true)
      const [bosoRes, lichkhamRes] = await Promise.all([
        apiClient.get('/hosokhambenh?limit=1000'),
        apiClient.get('/lichkham?limit=1000'),
      ])
      setDanhSachBoSo(bosoRes.data.data || [])
      setDanhSachLichKham(lichkhamRes.data.data || [])
    } catch (err) {
      showError('Không thể tải dữ liệu')
      console.error(err)
    } finally {
      setDangTa(false)
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
  }

  const xulyGuiForm = async (e) => {
    e.preventDefault()

    const errors = validateMedicalRecord(dulieuform)
    if (hasErrors(errors)) {
      setLoiSuForm(errors)
      showError('Vui lòng kiểm tra các trường thông tin')
      return
    }

    try {
      setDangGuiChiTieuThuCDung(true)
      const payload = {
        lichKhamId: parseInt(dulieuform.lichKhamId),
        trieuChung: dulieuform.trieuChung,
        chanDoan: dulieuform.chanDoan,
        keHoachDieuTri: dulieuform.keHoachDieuTri || null,
        ketLuan: dulieuform.ketLuan || null,
        ghiChu: dulieuform.ghiChu || null,
      }

      if (idchinh) {
        await apiClient.put(`/hosokhambenh/${idchinh}`, payload)
        success('Cập nhật hồ sơ khám bệnh thành công')
      } else {
        await apiClient.post('/hosokhambenh', payload)
        success('Tạo hồ sơ khám bệnh thành công')
      }

      setDuLieuForm({
        lichKhamId: '',
        trieuChung: '',
        chanDoan: '',
        keHoachDieuTri: '',
        ketLuan: '',
        ghiChu: '',
      })
      setLoiSuForm({})
      setIdChinh(null)
      setMoForm(false)
      laydulieu()
    } catch (err) {
      console.error('Error:', err.response?.data)
      const errorMessage = err.response?.data?.message || 'Lỗi khi lưu hồ sơ khám bệnh'
      showError(errorMessage)
    } finally {
      setDangGuiChiTieuThuCDung(false)
    }
  }

  const xulyXemChiTiet = async (boso) => {
    try {
      // Fetch fresh data from API to ensure doctor info is included
      const res = await apiClient.get(`/hosokhambenh/${boso.HoSoId}`)
      setBaoDangXem(res.data.data || boso)
      setMoChiTiet(true)
    } catch (err) {
      console.error('Error fetching detail:', err)
      // Fallback to record from table if API fails
      setBaoDangXem(boso)
      setMoChiTiet(true)
    }
  }

  const xulyChinhsua = (boso) => {
    setDuLieuForm({
      lichKhamId: boso.LichKhamId || '',
      trieuChung: boso.TrieuChung || '',
      chanDoan: boso.ChanDoan || '',
      keHoachDieuTri: boso.KeHoachDieuTri || '',
      ketLuan: boso.KetLuan || '',
      ghiChu: boso.GhiChu || '',
    })
    setLoiSuForm({})
    setIdChinh(boso.HoSoId)
    setMoForm(true)
  }

  const xulyXoa = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa hồ sơ khám bệnh này?')) return

    try {
      await apiClient.delete(`/hosokhambenh/${id}`)
      success('Xóa hồ sơ khám bệnh thành công')
      laydulieu()
    } catch (err) {
      showError('Không thể xóa hồ sơ khám bệnh')
      console.error(err)
    }
  }

  const xulyHuy = () => {
    setMoForm(false)
    setIdChinh(null)
    setDuLieuForm({
      lichKhamId: '',
      trieuChung: '',
      chanDoan: '',
      keHoachDieuTri: '',
      ketLuan: '',
      ghiChu: '',
    })
    setLoiSuForm({})
  }

  if (dangta) return <div className="loading">Đang tải...</div>

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>Quản Lý Hồ Sơ Khám Bệnh</h1>
        {coTheTao && (
          <button
            className="btn-primary"
            onClick={() => {
              setMoForm(true)
              setLoiSuForm({})
            }}
            disabled={moform}
          >
            ➕ Thêm hồ sơ khám
          </button>
        )}
      </div>

      {moform && coTheTao && (
        <div className="form-card">
          <div className="form-header">
            <h2>{idchinh ? 'Cập Nhật Hồ Sơ Khám Bệnh' : 'Tạo Hồ Sơ Khám Bệnh Mới'}</h2>
            <p className="form-subtitle">Điền đầy đủ thông tin về lịch khám và chẩn đoán</p>
          </div>

          <form onSubmit={xulyGuiForm} className="medical-form">
            <div className="form-group">
              <label>Lịch khám *</label>
              <select
                name="lichKhamId"
                value={dulieuform.lichKhamId}
                onChange={xulyThayDoiInput}
                required
              >
                <option value="">-- Chọn lịch khám --</option>
                {danhsachlichkham
                  .filter(apt => apt.TrangThai === 'DaXacNhan' || apt.TrangThai === 'DaKham')
                  .map(apt => (
                    <option key={apt.LichKhamId} value={apt.LichKhamId}>
                      {apt.BenhNhan?.HoTen || apt.BenhNhan?.MaBenhNhan} - {new Date(apt.ThoiGianBatDau).toLocaleString('vi-VN')}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Triệu chứng *</label>
                <textarea
                  name="trieuChung"
                  value={dulieuform.trieuChung}
                  onChange={xulyThayDoiInput}
                  placeholder="Nhập triệu chứng"
                  rows="3"
                  required
                />
                {loisuform.trieuChung && <span className="field-error">{loisuform.trieuChung}</span>}
              </div>

              <div className="form-group">
                <label>Chẩn đoán *</label>
                <textarea
                  name="chanDoan"
                  value={dulieuform.chanDoan}
                  onChange={xulyThayDoiInput}
                  placeholder="Nhập chẩn đoán"
                  rows="3"
                  required
                />
                {loisuform.chanDoan && <span className="field-error">{loisuform.chanDoan}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Kế hoạch điều trị</label>
                <textarea
                  name="keHoachDieuTri"
                  value={dulieuform.keHoachDieuTri}
                  onChange={xulyThayDoiInput}
                  placeholder="Nhập kế hoạch điều trị"
                  rows="3"
                />
                {loisuform.keHoachDieuTri && <span className="field-error">{loisuform.keHoachDieuTri}</span>}
              </div>

              <div className="form-group">
                <label>Kết luận</label>
                <textarea
                  name="ketLuan"
                  value={dulieuform.ketLuan}
                  onChange={xulyThayDoiInput}
                  placeholder="Nhập kết luận"
                  rows="3"
                />
                {loisuform.ketLuan && <span className="field-error">{loisuform.ketLuan}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Ghi chú</label>
              <textarea
                name="ghiChu"
                value={dulieuform.ghiChu}
                onChange={xulyThayDoiInput}
                placeholder="Nhập ghi chú"
                rows="2"
              />
              {loisuform.ghiChu && <span className="field-error">{loisuform.ghiChu}</span>}
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

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Mã hồ sơ</th>
              <th>Bệnh nhân</th>
              <th>Triệu chứng</th>
              <th>Chẩn đoán</th>
              <th>Ngày khám</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {danhsachboso.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  Chưa có hồ sơ khám bệnh
                </td>
              </tr>
            ) : (
              danhsachboso.map((boso) => (
                <tr key={boso.HoSoId}>
                  <td>{boso.MaHoSo}</td>
                  <td>{boso.BenhNhan?.HoTen || '-'}</td>
                  <td className="truncate">{boso.TrieuChung.substring(0, 30)}...</td>
                  <td className="truncate">{boso.ChanDoan.substring(0, 30)}...</td>
                  <td>{new Date(boso.NgayKham).toLocaleDateString('vi-VN')}</td>
                  <td>
                    {coTheXem ? (
                      <>
                        <button
                          className="btn-edit"
                          onClick={() => xulyXemChiTiet(boso)}
                          disabled={moform}
                        >
                          Chi tiết
                        </button>
                        {coTheTao && (
                          <>
                            <button
                              className="btn-edit btn-success"
                              onClick={() => xulyChinhsua(boso)}
                              disabled={moform}
                            >
                              Cập nhật
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => xulyXoa(boso.HoSoId)}
                              disabled={moform}
                            >
                              Xóa
                            </button>
                          </>
                        )}
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

      {mochiTiet && baodangxem && (
        <div className="modal-overlay" onClick={() => setMoChiTiet(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết hồ sơ khám bệnh</h2>
              <button className="modal-close" onClick={() => setMoChiTiet(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <div className="detail-col">
                  <strong>Mã hồ sơ:</strong> {baodangxem.MaHoSo}
                </div>
                <div className="detail-col">
                  <strong>Ngày khám:</strong> {new Date(baodangxem.NgayKham).toLocaleDateString('vi-VN')}
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-col">
                  <strong>Bệnh nhân:</strong> {baodangxem.BenhNhan?.HoTen} ({baodangxem.BenhNhan?.MaBenhNhan})
                </div>
                <div className="detail-col">
                  <strong>Bác sĩ:</strong> {baodangxem.BacSi?.NguoiDung?.HoTen || 'N/A'}
                </div>
              </div>

              <div className="detail-section">
                <h3>Triệu chứng</h3>
                <p>{baodangxem.TrieuChung}</p>
              </div>

              <div className="detail-section">
                <h3>Chẩn đoán</h3>
                <p>{baodangxem.ChanDoan}</p>
              </div>

              {baodangxem.KeHoachDieuTri && (
                <div className="detail-section">
                  <h3>Kế hoạch điều trị</h3>
                  <p>{baodangxem.KeHoachDieuTri}</p>
                </div>
              )}

              {baodangxem.KetLuan && (
                <div className="detail-section">
                  <h3>Kết luận</h3>
                  <p>{baodangxem.KetLuan}</p>
                </div>
              )}

              {baodangxem.GhiChu && (
                <div className="detail-section">
                  <h3>Ghi chú</h3>
                  <p>{baodangxem.GhiChu}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setMoChiTiet(false)} className="btn-primary">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
