import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { ToastContext } from '../context/ToastContext'
import apiClient from '../services/api'
import '../styles/list.css'

export default function DoctorPrescriptions() {
  const { user } = useContext(AuthContext)
  const { success, error: showError } = useContext(ToastContext)
  const [danhsachdonthuoc, setDanhSachDonThuoc] = useState([])
  const [danhsachhoSo, setDanhSachHoSo] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [dangta, setDangTa] = useState(true)
  const [dangguiForm, setDangGuiForm] = useState(false)
  const [moForm, setMoForm] = useState(false)
  const [moChiTiet, setMoChiTiet] = useState(false)
  const [donDangXem, setDonDangXem] = useState(null)
  const [idChinh, setIdChinh] = useState(null)
  const [dulieuform, setDuLieuForm] = useState({
    hoSoId: '',
    chiTiet: [{ tenThuoc: '', lieuLuong: '', soLuong: '', donVi: '', huongDanSuDung: '', thoiGianDung: '' }],
    ghiChu: '',
  })
  const [loisuForm, setLoiSuForm] = useState({})

  useEffect(() => {
    layDuLieu()
  }, [user])

  const layDuLieu = async () => {
    try {
      setDangTa(true)
      const [donthuocRes, hosoRes] = await Promise.all([
        apiClient.get(`/donthuoc?doctor=${user?.NguoiDungId}&limit=1000`),
        apiClient.get('/hosokhambenh?limit=1000'),
      ])
      setDanhSachDonThuoc(donthuocRes.data.data || [])
      setDanhSachHoSo(hosoRes.data.data || [])
    } catch (err) {
      showError('Không thể tải dữ liệu')
      console.error(err)
    } finally {
      setDangTa(false)
    }
  }

  const kiemtraForm = (data) => {
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
    const errors = kiemtraForm(dulieuform)
    if (Object.keys(errors).length > 0) {
      setLoiSuForm(errors)
      showError('Vui lòng kiểm tra các trường thông tin')
      return
    }

    try {
      setDangGuiForm(true)
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

      if (idChinh) {
        await apiClient.put(`/donthuoc/${idChinh}`, payload)
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
      setMoForm(false)
      setIdChinh(null)
      await layDuLieu()
    } catch (err) {
      showError('Không thể lưu đơn thuốc')
      console.error(err)
    } finally {
      setDangGuiForm(false)
    }
  }

  const xueNhan = (don) => {
    setDonDangXem(don)
    setMoChiTiet(true)
  }

  const moFormChinhSua = (don) => {
    setIdChinh(don.DonThuocId)
    setDuLieuForm({
      hoSoId: don.HoSoId,
      chiTiet: don.ChiTietDonThuoc || [{ tenThuoc: '', lieuLuong: '', soLuong: '', donVi: '', huongDanSuDung: '', thoiGianDung: '' }],
      ghiChu: don.GhiChu || '',
    })
    setMoForm(true)
  }

  const xoaDon = async (donId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn thuốc này?')) {
      try {
        await apiClient.delete(`/donthuoc/${donId}`)
        success('Xóa đơn thuốc thành công')
        await layDuLieu()
      } catch (err) {
        showError('Không thể xóa đơn thuốc')
        console.error(err)
      }
    }
  }

  // Filter danh sách đơn thuốc theo từ khóa tìm kiếm
  const danhsachloc = danhsachdonthuoc.filter(dt => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    const benhNhanName = dt.HoSoKhamBenh?.LichKham?.BenhNhan?.HoTen?.toLowerCase() || ''
    const maDon = dt.MaDonThuoc?.toLowerCase() || ''
    const tenThuoc = dt.ChiTiet?.map(ct => ct.TenThuoc).join(' ').toLowerCase() || ''
    return benhNhanName.includes(term) || maDon.includes(term) || tenThuoc.includes(term)
  })

  if (dangta) return <div className="loading">Đang tải...</div>

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>Quản Lý Đơn Thuốc</h1>
        <p>Bác sĩ: {user?.HoTen}</p>
      </div>

      {!moForm && (
        <div className="search-bar" style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên bệnh nhân, mã đơn, tên thuốc..."
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

      <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={() => setMoForm(!moForm)}>
          {moForm ? 'Hủy' : 'Tạo Đơn Thuốc Mới'}
        </button>
      </div>

      {moForm && (
        <div className="card" style={{ marginBottom: '30px', padding: '20px' }}>
          <h2>{idChinh ? 'Chỉnh Sửa Đơn Thuốc' : 'Tạo Đơn Thuốc Mới'}</h2>
          <form onSubmit={xulyGuiForm}>
            <div className="form-group">
              <label>Hồ Sơ Khám Bệnh *</label>
              <select
                value={dulieuform.hoSoId}
                onChange={(e) => setDuLieuForm({ ...dulieuform, hoSoId: e.target.value })}
                className="form-control"
              >
                <option value="">-- Chọn hồ sơ --</option>
                {danhsachhoSo.map(hs => (
                  <option key={hs.HoSoId} value={hs.HoSoId}>
                    {hs.BenhNhan?.HoTen} ({hs.NgayTao})
                  </option>
                ))}
              </select>
              {loisuForm.hoSoId && <span className="error">{loisuForm.hoSoId}</span>}
            </div>

            <div className="form-group">
              <label>Thông Tin Thuốc</label>
              {dulieuform.chiTiet.map((item, idx) => (
                <div key={idx} className="medicine-item" style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <input
                    type="text"
                    placeholder="Tên thuốc *"
                    value={item.tenThuoc}
                    onChange={(e) => {
                      const newChiTiet = [...dulieuform.chiTiet]
                      newChiTiet[idx].tenThuoc = e.target.value
                      setDuLieuForm({ ...dulieuform, chiTiet: newChiTiet })
                    }}
                    className="form-control"
                    style={{ marginBottom: '10px' }}
                  />
                  <input
                    type="text"
                    placeholder="Liều lượng"
                    value={item.lieuLuong}
                    onChange={(e) => {
                      const newChiTiet = [...dulieuform.chiTiet]
                      newChiTiet[idx].lieuLuong = e.target.value
                      setDuLieuForm({ ...dulieuform, chiTiet: newChiTiet })
                    }}
                    className="form-control"
                    style={{ marginBottom: '10px' }}
                  />
                  <input
                    type="number"
                    placeholder="Số lượng"
                    value={item.soLuong}
                    onChange={(e) => {
                      const newChiTiet = [...dulieuform.chiTiet]
                      newChiTiet[idx].soLuong = e.target.value
                      setDuLieuForm({ ...dulieuform, chiTiet: newChiTiet })
                    }}
                    className="form-control"
                    style={{ marginBottom: '10px' }}
                  />
                  <input
                    type="text"
                    placeholder="Đơn vị"
                    value={item.donVi}
                    onChange={(e) => {
                      const newChiTiet = [...dulieuform.chiTiet]
                      newChiTiet[idx].donVi = e.target.value
                      setDuLieuForm({ ...dulieuform, chiTiet: newChiTiet })
                    }}
                    className="form-control"
                    style={{ marginBottom: '10px' }}
                  />
                  <textarea
                    placeholder="Hướng dẫn sử dụng"
                    value={item.huongDanSuDung}
                    onChange={(e) => {
                      const newChiTiet = [...dulieuform.chiTiet]
                      newChiTiet[idx].huongDanSuDung = e.target.value
                      setDuLieuForm({ ...dulieuform, chiTiet: newChiTiet })
                    }}
                    className="form-control"
                    style={{ marginBottom: '10px' }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => {
                      const newChiTiet = dulieuform.chiTiet.filter((_, i) => i !== idx)
                      setDuLieuForm({ ...dulieuform, chiTiet: newChiTiet })
                    }}
                  >
                    Xóa
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  setDuLieuForm({
                    ...dulieuform,
                    chiTiet: [...dulieuform.chiTiet, { tenThuoc: '', lieuLuong: '', soLuong: '', donVi: '', huongDanSuDung: '', thoiGianDung: '' }]
                  })
                }}
              >
                + Thêm Thuốc
              </button>
            </div>

            <div className="form-group">
              <label>Ghi Chú</label>
              <textarea
                value={dulieuform.ghiChu}
                onChange={(e) => setDuLieuForm({ ...dulieuform, ghiChu: e.target.value })}
                className="form-control"
                rows="3"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={dangguiForm}>
              {dangguiForm ? 'Đang lưu...' : idChinh ? 'Cập Nhật' : 'Tạo Đơn'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2>Danh Sách Đơn Thuốc ({danhsachdonthuoc.length})</h2>
        </div>

        {danhsachloc.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            {searchTerm ? 'Không tìm thấy đơn thuốc nào' : 'Chưa có đơn thuốc nào'}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Bệnh Nhân</th>
                  <th>Ngày Tạo</th>
                  <th>Số Loại Thuốc</th>
                  <th>Ghi Chú</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {danhsachloc.map(don => (
                  <tr key={don.DonThuocId}>
                    <td>{don.HoSo?.BenhNhan?.HoTen || '-'}</td>
                    <td>{new Date(don.NgayTao).toLocaleDateString('vi-VN')}</td>
                    <td>{don.ChiTietDonThuoc?.length || 0}</td>
                    <td>{don.GhiChu?.substring(0, 30) || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => xueNhan(don)}
                        >
                          Xem
                        </button>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => moFormChinhSua(don)}
                        >
                          Cập nhật
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => xoaDon(don.DonThuocId)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {moChiTiet && donDangXem && (
        <div className="modal-backdrop" onClick={() => setMoChiTiet(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi Tiết Đơn Thuốc</h2>
              <button className="close-btn" onClick={() => setMoChiTiet(false)}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>Bệnh Nhân:</strong> {donDangXem.HoSo?.BenhNhan?.HoTen}</p>
              <p><strong>Ngày Tạo:</strong> {new Date(donDangXem.NgayTao).toLocaleDateString('vi-VN')}</p>
              <p><strong>Ghi Chú:</strong> {donDangXem.GhiChu || '-'}</p>
              <h3>Danh Sách Thuốc:</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tên Thuốc</th>
                      <th>Liều Lượng</th>
                      <th>Số Lượng</th>
                      <th>Đơn Vị</th>
                      <th>Hướng Dẫn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donDangXem.ChiTietDonThuoc?.map((ct, idx) => (
                      <tr key={idx}>
                        <td>{ct.TenThuoc}</td>
                        <td>{ct.LieuLuong || '-'}</td>
                        <td>{ct.SoLuong || '-'}</td>
                        <td>{ct.DonVi || '-'}</td>
                        <td>{ct.HuongDanSuDung || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
