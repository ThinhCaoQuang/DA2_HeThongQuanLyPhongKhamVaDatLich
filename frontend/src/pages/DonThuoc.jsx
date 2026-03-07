import { useState, useEffect, useContext } from 'react'
import html2pdf from 'html2pdf.js'
import apiClient from '../services/api'
import { ToastContext } from '../context/ToastContext'
import { AuthContext } from '../context/AuthContext'
import '../styles/list.css'

export default function DonThuoc() {
  const { success, error: showError } = useContext(ToastContext)
  const { user } = useContext(AuthContext)
  const [danhsachdonthuoc, setDanhSachDonThuoc] = useState([])
  const [danhsachboso, setDanhSachBoSo] = useState([])
  const [dangta, setDangTa] = useState(true)
  const [dangguichitieuthucdung, setDangGuiChiTieuThuCDung] = useState(false)
  const [moform, setMoForm] = useState(false)
  const [mochiTiet, setMoChiTiet] = useState(false)
  const [dondangxem, setDonDangXem] = useState(null)
  const [idchinh, setIdChinh] = useState(null)
  const [dulieuform, setDuLieuForm] = useState({
    hoSoId: '',
    chiTiet: [{ tenThuoc: '', lieuLuong: '', soLuong: '', donVi: '', huongDanSuDung: '', thoiGianDung: '' }],
    ghiChu: '',
  })
  const [loisuform, setLoiSuForm] = useState({})
  const [locTaiHoSoId, setLocTaiHoSoId] = useState('')

  const coTheTao = user?.role === 'BacSi' || user?.role === 'QuanTri'
  const coTheXem = user?.role === 'BacSi' || user?.role === 'QuanTri' || user?.role === 'LeTan'

  useEffect(() => {
    laydulieu()
  }, [])

  const laydulieu = async () => {
    try {
      setDangTa(true)
      const [donthuocRes, bosoRes] = await Promise.all([
        apiClient.get('/donthuoc?limit=1000'),
        apiClient.get('/hosokhambenh?limit=1000'),
      ])
      setDanhSachDonThuoc(donthuocRes.data.data || [])
      setDanhSachBoSo(bosoRes.data.data || [])
    } catch (err) {
      showError('Không thể tải dữ liệu')
      console.error(err)
    } finally {
      setDangTa(false)
    }
  }

  const kiemTraForm = (data) => {
    const errors = {}
    if (!data.hoSoId) errors.hoSoId = 'Hồ sơ khám bệnh không được để trống'
    if (!data.chiTiet || data.chiTiet.length === 0) {
      errors.chiTiet = 'Phải có ít nhất một loại thuốc'
    } else {
      data.chiTiet.forEach((item, idx) => {
        if (!item.tenThuoc) errors[`tenThuoc_${idx}`] = 'Tên thuốc không được để trống'
      })
    }
    return errors
  }

  const xulyGuiForm = async (e) => {
    e.preventDefault()

    const errors = kiemTraForm(dulieuform)
    if (Object.keys(errors).length > 0) {
      setLoiSuForm(errors)
      showError('Vui lòng kiểm tra các trường thông tin')
      return
    }

    try {
      setDangGuiChiTieuThuCDung(true)

      const payload = {
        hoSoId: parseInt(dulieuform.hoSoId),
        chiTiet: dulieuform.chiTiet.map(item => ({
          tenThuoc: item.tenThuoc,
          lieuLuong: item.lieuLuong || null,
          soLuong: item.soLuong ? parseInt(item.soLuong) : null,
          donVi: item.donVi || null,
          huongDanSuDung: item.huongDanSuDung || null,
          thoiGianDung: item.thoiGianDung || null,
        })),
        ghiChu: dulieuform.ghiChu || null,
      }

      if (idchinh) {
        await apiClient.put(`/donthuoc/${idchinh}`, payload)
        success('Cập nhật đơn thuốc thành công')
      } else {
        await apiClient.post('/donthuoc', payload)
        success('Tạo đơn thuốc thành công')
      }

      setDuLieuForm({
        hoSoId: '',
        chiTiet: [{ tenThuoc: '', lieuLuong: '', soLuong: '', donVi: '', huongDanSuDung: '', thoiGianDung: '' }],
        ghiChu: '',
      })
      setLoiSuForm({})
      setIdChinh(null)
      setMoForm(false)
      laydulieu()
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi lưu đơn thuốc'
      showError(errorMessage)
    } finally {
      setDangGuiChiTieuThuCDung(false)
    }
  }

  const xulyChinhsua = (record) => {
    setDuLieuForm({
      hoSoId: record.HoSoId || '',
      chiTiet: record.DonThuocChiTiets && record.DonThuocChiTiets.length > 0
        ? record.DonThuocChiTiets.map(ct => ({
            tenThuoc: ct.TenThuoc,
            lieuLuong: ct.LieuLuong || '',
            soLuong: ct.SoLuong || '',
            donVi: ct.DonVi || '',
            huongDanSuDung: ct.HuongDanSuDung || '',
            thoiGianDung: ct.ThoiGianDung || '',
          }))
        : [{ tenThuoc: '', lieuLuong: '', soLuong: '', donVi: '', huongDanSuDung: '', thoiGianDung: '' }],
      ghiChu: record.GhiChu || '',
    })
    setLoiSuForm({})
    setIdChinh(record.DonThuocId)
    setMoForm(true)
  }

  const xulyXemChiTiet = async (donthuoc) => {
    try {
      const res = await apiClient.get(`/donthuoc/${donthuoc.DonThuocId}`)
      setDonDangXem(res.data.data || donthuoc)
      setMoChiTiet(true)
    } catch (err) {
      console.error('Error fetching detail:', err)
      setDonDangXem(donthuoc)
      setMoChiTiet(true)
    }
  }

  const xulyInDonThuoc = () => {
    if (!dondangxem) return

    const donthuoc = dondangxem
    const boso = donthuoc.HoSoKhamBenh
    const thuocs = donthuoc.DonThuocChiTiets || []
    
    const tinhTuoi = (ngaySinh) => {
      if (!ngaySinh) return null
      const today = new Date()
      const birth = new Date(ngaySinh)
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }
      return age
    }
    
    const tuoiBenhNhan = tinhTuoi(boso?.BenhNhan?.NgaySinh)
    
    console.log('Dữ liệu đơn thuốc:', dondangxem)
    console.log('Hồ sơ:', boso)
    console.log('Thông tin bệnh nhân:', boso?.BenhNhan)
    console.log('Tuổi bệnh nhân:', tuoiBenhNhan)
    console.log('Thông tin bác sĩ:', boso?.BacSi?.NguoiDung)
    
    const phanTu = document.createElement('div')
    phanTu.innerHTML = `
      <div style="font-family: 'Times New Roman', serif; padding: 30px; max-width: 800px; margin: 0 auto;">
        <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px;">
          <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 5px 0;">ĐƠN THUỐC</h1>
          <p style="font-size: 14px; color: #666; margin: 0;">Mã: ${donthuoc.MaDonThuoc}</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; font-size: 14px;">
          <div>
            <div style="display: flex; margin-bottom: 8px;">
              <div style="font-weight: bold; width: 120px;">Bệnh nhân:</div>
              <div style="flex: 1;">${boso?.BenhNhan?.HoTen || 'N/A'}</div>
            </div>
            <div style="display: flex; margin-bottom: 8px;">
              <div style="font-weight: bold; width: 120px;">Tuổi:</div>
              <div style="flex: 1;">${tuoiBenhNhan ? tuoiBenhNhan + ' tuổi' : 'N/A'}</div>
            </div>
            <div style="display: flex; margin-bottom: 8px;">
              <div style="font-weight: bold; width: 120px;">Giới tính:</div>
              <div style="flex: 1;">${boso?.BenhNhan?.GioiTinh || 'N/A'}</div>
            </div>
          </div>
          <div>
            <div style="display: flex; margin-bottom: 8px;">
              <div style="font-weight: bold; width: 120px;">Hồ sơ:</div>
              <div style="flex: 1;">${boso?.MaHoSo || 'N/A'}</div>
            </div>
            <div style="display: flex; margin-bottom: 8px;">
              <div style="font-weight: bold; width: 120px;">Ngày khám:</div>
              <div style="flex: 1;">${boso?.NgayKham ? new Date(boso.NgayKham).toLocaleDateString('vi-VN') : 'N/A'}</div>
            </div>
            <div style="display: flex; margin-bottom: 8px;">
              <div style="font-weight: bold; width: 120px;">Bác sĩ:</div>
              <div style="flex: 1;">${boso?.BacSi?.NguoiDung?.HoTen || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div style="margin: 20px 0;">
          <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">DANH SÁCH THUỐC</h2>
          ${thuocs.length > 0 ? thuocs.map((med, idx) => `
            <div style="margin-bottom: 12px; padding: 8px 0; border-bottom: 1px dotted #ddd; font-size: 13px;">
              <div style="font-weight: bold; margin-bottom: 3px;">${idx + 1}. ${med.TenThuoc}${med.LieuLuong ? ' - ' + med.LieuLuong : ''}</div>
              <div style="color: #666; font-size: 12px;">
                ${med.SoLuong ? `<div>Số lượng: <strong>${med.SoLuong} ${med.DonVi || 'viên'}</strong></div>` : ''}
                ${med.HuongDanSuDung ? `<div>Cách dùng: ${med.HuongDanSuDung}</div>` : ''}
                ${med.ThoiGianDung ? `<div>Thời gian dùng: ${med.ThoiGianDung}</div>` : ''}
              </div>
            </div>
          `).join('') : '<p>Không có danh sách thuốc</p>'}
        </div>

        ${donthuoc.GhiChu ? `
          <div style="margin: 20px 0;">
            <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">GHI CHÚ</h2>
            <p style="font-size: 13px; line-height: 1.5;">${donthuoc.GhiChu}</p>
          </div>
        ` : ''}

        <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; text-align: center;">
          <div>
            <div style="font-size: 12px; margin-bottom: 10px;">Ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</div>
          </div>
          <div>
            <div style="font-size: 12px;">Ký tên bác sĩ</div>
            <div style="border-top: 1px solid #333; margin-top: 50px; font-size: 12px;"></div>
          </div>
        </div>
      </div>
    `

    const opt = {
      margin: 10,
      filename: `DonThuoc_${donthuoc.MaDonThuoc}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    }

    html2pdf().set(opt).from(phanTu).save()
  }

  const xulyHuy = () => {
    setMoForm(false)
    setIdChinh(null)
    setDuLieuForm({
      hoSoId: '',
      chiTiet: [{ tenThuoc: '', lieuLuong: '', soLuong: '', donVi: '', huongDanSuDung: '', thoiGianDung: '' }],
      ghiChu: '',
    })
    setLoiSuForm({})
  }

  const xulyXoa = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa đơn thuốc này?')) return

    try {
      await apiClient.delete(`/donthuoc/${id}`)
      success('Xóa đơn thuốc thành công')
      laydulieu()
    } catch (err) {
      showError('Không thể xóa đơn thuốc')
      console.error(err)
    }
  }

  const layThongTinBoSo = (id) => {
    const boso = danhsachboso.find(r => r.HoSoId === id)
    if (boso) {
      return `${boso.MaHoSo} - ${boso.BenhNhan?.HoTen || 'N/A'}`
    }
    return `#${id}`
  }

  const themHangThuoc = () => {
    setDuLieuForm(prev => ({
      ...prev,
      chiTiet: [...prev.chiTiet, { tenThuoc: '', lieuLuong: '', soLuong: '', donVi: '', huongDanSuDung: '', thoiGianDung: '' }]
    }))
  }

  const xoaHangThuoc = (idx) => {
    setDuLieuForm(prev => ({
      ...prev,
      chiTiet: prev.chiTiet.filter((_, i) => i !== idx)
    }))
  }

  const capNhatHangThuoc = (idx, field, value) => {
    setDuLieuForm(prev => ({
      ...prev,
      chiTiet: prev.chiTiet.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      )
    }))
  }

  const donthuocDaLoc = danhsachdonthuoc.filter(p =>
    !locTaiHoSoId || p.HoSoId === parseInt(locTaiHoSoId)
  )

  if (dangta) return <div className="container">Đang tải...</div>

  return (
    <div className="container">
      <h1>Quản Lý Đơn Thuốc</h1>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '2rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-dark)' }}>
            Lọc theo hồ sơ:
          </label>
          <select
            value={locTaiHoSoId}
            onChange={(e) => setLocTaiHoSoId(e.target.value)}
            style={{
              width: '100%',
              padding: '0.7rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '0.95rem',
              backgroundColor: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <option value="">Tất cả hồ sơ</option>
            {danhsachboso.map(r => (
              <option key={r.HoSoId} value={r.HoSoId}>
                {r.MaHoSo} - {r.BenhNhan?.HoTen}
              </option>
            ))}
          </select>
        </div>

        {coTheTao && (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setMoForm(!moform)}
              style={{
                background: moform ? '#6c757d' : 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: moform ? '0 2px 8px rgba(0,0,0,0.1)' : '0 4px 12px rgba(0, 123, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!moform) {
                  e.target.style.background = 'linear-gradient(135deg, #0056b3 0%, #003a7a 100%)'
                  e.target.style.boxShadow = '0 6px 16px rgba(0, 123, 255, 0.4)'
                  e.target.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!moform) {
                  e.target.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)'
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3)'
                  e.target.style.transform = 'translateY(0)'
                }
              }}
            >
              <span style={{ fontSize: '1.3rem' }}>{moform ? '✕' : '+'}</span>
              <span>{moform ? 'Hủy' : 'Thêm đơn thuốc'}</span>
            </button>
          </div>
        )}
      </div>

      {moform && (
        <div className="form-section">
          <h2>{idchinh ? 'Chỉnh sửa đơn thuốc' : 'Tạo đơn thuốc mới'}</h2>
          <form onSubmit={xulyGuiForm}>
            <div className="form-row">
              <div className="form-group">
                <label>Hồ sơ khám bệnh *</label>
                <select
                  value={dulieuform.hoSoId}
                  onChange={(e) => setDuLieuForm({ ...dulieuform, hoSoId: e.target.value })}
                  className={loisuform.hoSoId ? 'input-error' : ''}
                  disabled={!!idchinh}
                >
                  <option value="">-- Chọn hồ sơ khám --</option>
                  {danhsachboso.map(r => (
                    <option key={r.HoSoId} value={r.HoSoId}>
                      {r.MaHoSo} - {r.BenhNhan?.HoTen}
                    </option>
                  ))}
                </select>
                {loisuform.hoSoId && <span className="error">{loisuform.hoSoId}</span>}
              </div>
            </div>

            <h3>Chi tiết đơn thuốc *</h3>
            {dulieuform.chiTiet.map((med, idx) => (
              <div key={idx} className="medicine-row" style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Tên thuốc *</label>
                    <input
                      type="text"
                      value={med.tenThuoc}
                      onChange={(e) => capNhatHangThuoc(idx, 'tenThuoc', e.target.value)}
                      className={loisuform[`tenThuoc_${idx}`] ? 'input-error' : ''}
                    />
                    {loisuform[`tenThuoc_${idx}`] && <span className="error">{loisuform[`tenThuoc_${idx}`]}</span>}
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Liều lượng</label>
                    <input
                      type="text"
                      value={med.lieuLuong}
                      onChange={(e) => capNhatHangThuoc(idx, 'lieuLuong', e.target.value)}
                      placeholder="VD: 500mg"
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Số lượng</label>
                    <input
                      type="number"
                      value={med.soLuong}
                      onChange={(e) => capNhatHangThuoc(idx, 'soLuong', e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Đơn vị</label>
                    <input
                      type="text"
                      value={med.donVi}
                      onChange={(e) => capNhatHangThuoc(idx, 'donVi', e.target.value)}
                      placeholder="VD: viên"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>Hướng dẫn sử dụng</label>
                    <input
                      type="text"
                      value={med.huongDanSuDung}
                      onChange={(e) => capNhatHangThuoc(idx, 'huongDanSuDung', e.target.value)}
                      placeholder="VD: Uống sau bữa ăn"
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Thời gian dùng</label>
                    <input
                      type="text"
                      value={med.thoiGianDung}
                      onChange={(e) => capNhatHangThuoc(idx, 'thoiGianDung', e.target.value)}
                      placeholder="VD: 2 lần/ngày"
                    />
                  </div>
                  {dulieuform.chiTiet.length > 1 && (
                    <div className="form-group" style={{ alignSelf: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn-delete"
                        onClick={() => xoaHangThuoc(idx)}
                        style={{ padding: '8px 15px' }}
                      >
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button type="button" className="btn-add" onClick={themHangThuoc} style={{ marginBottom: '15px' }}>
              + Thêm thuốc
            </button>

            <div className="form-row">
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  value={dulieuform.ghiChu}
                  onChange={(e) => setDuLieuForm({ ...dulieuform, ghiChu: e.target.value })}
                  rows="3"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit" disabled={dangguichitieuthucdung}>
                {dangguichitieuthucdung ? 'Đang lưu...' : idchinh ? 'Cập nhật' : 'Tạo mới'}
              </button>
              <button type="button" className="btn-cancel" onClick={xulyHuy}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-section">
        <h2>Danh sách đơn thuốc ({donthuocDaLoc.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Hồ sơ khám</th>
              <th>Số loại thuốc</th>
              <th>Ngày cấp</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {donthuocDaLoc.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              donthuocDaLoc.map((donthuoc) => (
                <tr key={donthuoc.DonThuocId}>
                  <td>{donthuoc.MaDonThuoc}</td>
                  <td>{layThongTinBoSo(donthuoc.HoSoId)}</td>
                  <td>{donthuoc.DonThuocChiTiets?.length || 0}</td>
                  <td>{new Date(donthuoc.CreatedAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    {coTheXem ? (
                      <>
                        <button
                          className="btn-edit"
                          onClick={() => xulyXemChiTiet(donthuoc)}
                          disabled={moform}
                        >
                          Chi tiết
                        </button>
                        {coTheTao && (
                          <>
                            <button
                              className="btn-edit btn-success"
                              onClick={() => xulyChinhsua(donthuoc)}
                              disabled={moform}
                            >
                              Cập nhật
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => xulyXoa(donthuoc.DonThuocId)}
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

      {mochiTiet && dondangxem && (
        <div className="modal-overlay" onClick={() => setMoChiTiet(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết Đơn Thuốc</h2>
              <button className="modal-close" onClick={() => setMoChiTiet(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <div className="detail-col">
                  <strong>Mã đơn:</strong> {dondangxem.MaDonThuoc}
                </div>
                <div className="detail-col">
                  <strong>Ngày tạo:</strong> {new Date(dondangxem.CreatedAt).toLocaleDateString('vi-VN')}
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-col">
                  <strong>Hồ sơ:</strong> {dondangxem.HoSoKhamBenh?.MaHoSo}
                </div>
                <div className="detail-col">
                  <strong>Bệnh nhân:</strong> {dondangxem.HoSoKhamBenh?.BenhNhan?.HoTen}
                </div>
              </div>

              <div className="detail-section">
                <h3>Danh sách Thuốc</h3>
                {dondangxem.DonThuocChiTiets && dondangxem.DonThuocChiTiets.length > 0 ? (
                  <div className="medicines-list">
                    {dondangxem.DonThuocChiTiets.map((med, idx) => (
                      <div key={idx} className="medicine-detail" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-light)', borderRadius: '4px' }}>
                        <div className="medicine-name" style={{ marginBottom: '0.5rem' }}>
                          <strong>{idx + 1}. {med.TenThuoc}</strong>
                          {med.LieuLuong && <span style={{ marginLeft: '0.5rem', color: '#666' }}> - {med.LieuLuong}</span>}
                        </div>
                        <div className="medicine-info" style={{ fontSize: '0.9rem', color: '#555' }}>
                          {med.SoLuong && <div>Số lượng: <strong>{med.SoLuong} {med.DonVi || 'viên'}</strong></div>}
                          {med.HuongDanSuDung && <div>Cách dùng: <strong>{med.HuongDanSuDung}</strong></div>}
                          {med.ThoiGianDung && <div>Thời gian: <strong>{med.ThoiGianDung}</strong></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Không có thuốc nào</p>
                )}
              </div>

              {dondangxem.GhiChu && (
                <div className="detail-section">
                  <h3>Ghi chú</h3>
                  <p>{dondangxem.GhiChu}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => xulyInDonThuoc()} className="btn-edit" style={{marginRight: '0.5rem'}}>
                In đơn
              </button>
              <button onClick={() => setMoChiTiet(false)} className="btn-primary">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
