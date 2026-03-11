import { useState, useEffect, useContext } from 'react'
import apiClient from '../services/api'
import { ToastContext } from '../context/ToastContext'
import { AuthContext } from '../context/AuthContext'
import '../styles/list.css'

export default function QuanLyNguoiDung() {
  const { success, error: showError } = useContext(ToastContext)
  const { user } = useContext(AuthContext)
  const [users, setUsers] = useState([])
  const [chuyenKhoas, setChuyenKhoas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    // Thông tin cá nhân
    hoTen: '',
    gioiTinh: 'Khac',
    dienThoai: '',
    email: '',
    diaChi: '',
    thanhPho: '',
    ngaySinh: '',
    // Tài khoản
    tenDangNhap: '',
    matKhau: '',
    vaiTro: 'LeTan',
    trangThai: 'HoatDong',
    // Bác sĩ
    soChungChi: '',
    capHocVan: '',
    namKinhNghiem: 0,
    tieuSu: '',
    trangThaiBacSi: 'HoatDong',
    chuyenKhoaIds: []
  })

  const [errors, setErrors] = useState({})

  // Chỉ user role QuanTri mới truy cập được
  const hasAccess = user?.role === 'QuanTri'

  useEffect(() => {
    if (hasAccess) {
      loadData()
      loadChuyenKhoas()
    }
  }, [hasAccess, filterRole, filterStatus])

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.dropdown-chuyenkhoa')) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  const loadData = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filterRole) params.role = filterRole
      if (filterStatus) params.status = filterStatus
      
      const response = await apiClient.get('/users', { params })
      setUsers(response.data.data || [])
    } catch (err) {
      showError('Không thể tải danh sách người dùng')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadChuyenKhoas = async () => {
    try {
      const response = await apiClient.get('/chuyenkhoa?limit=100')
      setChuyenKhoas(response.data.data || [])
    } catch (err) {
      console.error('Không thể tải chuyên khoa:', err)
    }
  }

  const handleOpenForm = (userData = null) => {
    if (userData) {
      // Edit mode
      setIsEdit(true)
      setCurrentUserId(userData.TaiKhoanId)
      setFormData({
        hoTen: userData.NguoiDung?.HoTen || '',
        gioiTinh: userData.NguoiDung?.GioiTinh || 'Khac',
        dienThoai: userData.NguoiDung?.DienThoai || '',
        email: userData.NguoiDung?.Email || '',
        diaChi: userData.NguoiDung?.DiaChi || '',
        thanhPho: userData.NguoiDung?.ThanhPho || '',
        ngaySinh: userData.NguoiDung?.NgaySinh ? userData.NguoiDung.NgaySinh.split('T')[0] : '',
        tenDangNhap: userData.TenDangNhap || '',
        matKhau: '', // Không hiển thị mật khẩu cũ
        vaiTro: userData.VaiTro || 'LeTan',
        trangThai: userData.TrangThai || 'HoatDong',
        soChungChi: userData.BacSi?.SoChungChi || '',
        capHocVan: userData.BacSi?.CapHocVan || '',
        namKinhNghiem: userData.BacSi?.NamKinhNghiem || 0,
        tieuSu: userData.BacSi?.TieuSu || '',
        trangThaiBacSi: userData.BacSi?.TrangThai || 'HoatDong',
        chuyenKhoaIds: userData.BacSi?.ChuyenKhoas?.map(ck => ck.ChuyenKhoaId) || []
      })
    } else {
      // Create mode
      setIsEdit(false)
      setCurrentUserId(null)
      setFormData({
        hoTen: '',
        gioiTinh: 'Khac',
        dienThoai: '',
        email: '',
        diaChi: '',
        thanhPho: '',
        ngaySinh: '',
        tenDangNhap: '',
        matKhau: '',
        vaiTro: 'LeTan',
        trangThai: 'HoatDong',
        soChungChi: '',
        capHocVan: '',
        namKinhNghiem: 0,
        tieuSu: '',
        trangThaiBacSi: 'HoatDong',
        chuyenKhoaIds: []
      })
    }
    setErrors({})
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setIsEdit(false)
    setCurrentUserId(null)
    setErrors({})
    setDropdownOpen(false)
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.hoTen.trim()) newErrors.hoTen = 'Họ tên là bắt buộc'
    if (!formData.tenDangNhap.trim()) newErrors.tenDangNhap = 'Tên đăng nhập là bắt buộc'
    if (!isEdit && !formData.matKhau) newErrors.matKhau = 'Mật khẩu là bắt buộc'
    if (!isEdit && formData.matKhau && formData.matKhau.length < 6) {
      newErrors.matKhau = 'Mật khẩu phải có ít nhất 6 ký tự'
    }
    if (formData.vaiTro === 'BacSi' && !formData.soChungChi.trim()) {
      newErrors.soChungChi = 'Số chứng chỉ là bắt buộc cho bác sĩ'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) return

    try {
      if (isEdit) {
        await apiClient.put(`/users/${currentUserId}`, formData)
        success('Cập nhật người dùng thành công')
      } else {
        await apiClient.post('/users', formData)
        success('Tạo người dùng thành công')
      }
      
      handleCloseForm()
      loadData()
    } catch (err) {
      showError(err.response?.data?.message || 'Có lỗi xảy ra')
      console.error(err)
    }
  }

  const handleChangePassword = async (userId) => {
    const newPassword = prompt('Nhập mật khẩu mới (ít nhất 6 ký tự):')
    
    if (!newPassword) return
    if (newPassword.length < 6) {
      showError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    try {
      await apiClient.put(`/users/${userId}/change-password`, {
        matKhauMoi: newPassword
      })
      success('Đổi mật khẩu thành công')
    } catch (err) {
      showError(err.response?.data?.message || 'Không thể đổi mật khẩu')
    }
  }

  const handleToggleStatus = async (userId) => {
    if (!confirm('Bạn có chắc muốn thay đổi trạng thái tài khoản này?')) return

    try {
      await apiClient.put(`/users/${userId}/toggle-status`)
      success('Thay đổi trạng thái thành công')
      loadData()
    } catch (err) {
      showError(err.response?.data?.message || 'Không thể thay đổi trạng thái')
    }
  }

  const handleDelete = async (userId) => {
    if (!confirm('Bạn có chắc muốn xóa người dùng này? Hành động này không thể hoàn tác!')) return

    try {
      await apiClient.delete(`/users/${userId}`)
      success('Xóa người dùng thành công')
      loadData()
    } catch (err) {
      showError(err.response?.data?.message || 'Không thể xóa người dùng')
    }
  }

  const handleChuyenKhoaChange = (chuyenKhoaId) => {
    const currentIds = formData.chuyenKhoaIds || []
    if (currentIds.includes(chuyenKhoaId)) {
      setFormData({
        ...formData,
        chuyenKhoaIds: currentIds.filter(id => id !== chuyenKhoaId)
      })
    } else {
      setFormData({
        ...formData,
        chuyenKhoaIds: [...currentIds, chuyenKhoaId]
      })
    }
  }

  if (!hasAccess) {
    return (
      <div className="list-page">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Bạn không có quyền truy cập trang này</h2>
          <p>Chỉ Quản trị viên mới có thể quản lý người dùng.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>Quản Lý Người Dùng</h1>
        <button
          className="btn-primary"
          onClick={() => handleOpenForm()}
          disabled={showForm}
        >
          Tạo Người Dùng Mới
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, email, số điện thoại..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            outline: 'none'
          }}
        />
        
        <select 
          value={filterRole} 
          onChange={(e) => setFilterRole(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          <option value="">Tất cả vai trò</option>
          <option value="QuanTri">Quản trị</option>
          <option value="QuanLy">Quản lý</option>
          <option value="LeTan">Lễ tân</option>
          <option value="BacSi">Bác sĩ</option>
        </select>

        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="HoatDong">Hoạt động</option>
          <option value="KhongHoatDong">Không hoạt động</option>
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">{isEdit ? 'Cập Nhật Người Dùng' : 'Tạo Người Dùng Mới'}</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <h3>Thông tin cá nhân</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Họ và tên *</label>
                <input
                  type="text"
                  value={formData.hoTen}
                  onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                  className={errors.hoTen ? 'error' : ''}
                />
                {errors.hoTen && <span className="error-text">{errors.hoTen}</span>}
              </div>

              <div className="form-group">
                <label>Giới tính</label>
                <select
                  value={formData.gioiTinh}
                  onChange={(e) => setFormData({ ...formData, gioiTinh: e.target.value })}
                >
                  <option value="Nam">Nam</option>
                  <option value="Nu">Nữ</option>
                  <option value="Khac">Khác</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="text"
                  value={formData.dienThoai}
                  onChange={(e) => setFormData({ ...formData, dienThoai: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ngày sinh</label>
                <input
                  type="date"
                  value={formData.ngaySinh}
                  onChange={(e) => setFormData({ ...formData, ngaySinh: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Thành phố</label>
                <input
                  type="text"
                  value={formData.thanhPho}
                  onChange={(e) => setFormData({ ...formData, thanhPho: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Địa chỉ</label>
              <textarea
                value={formData.diaChi}
                onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                rows="2"
              />
            </div>

            <h3>Thông tin tài khoản</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Tên đăng nhập *</label>
                <input
                  type="text"
                  value={formData.tenDangNhap}
                  onChange={(e) => setFormData({ ...formData, tenDangNhap: e.target.value })}
                  className={errors.tenDangNhap ? 'error' : ''}
                  disabled={isEdit}
                />
                {errors.tenDangNhap && <span className="error-text">{errors.tenDangNhap}</span>}
                {isEdit && (
                  <button
                    type="button"
                    onClick={() => handleChangePassword(currentUserId)}
                    style={{
                      marginTop: '8px',
                      padding: '6px 12px',
                      backgroundColor: '#3498db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}
                  >
                    Đổi mật khẩu
                  </button>
                )}
              </div>

              {!isEdit && (
                <div className="form-group">
                  <label>Mật khẩu *</label>
                  <input
                    type="password"
                    value={formData.matKhau}
                    onChange={(e) => setFormData({ ...formData, matKhau: e.target.value })}
                    className={errors.matKhau ? 'error' : ''}
                  />
                  {errors.matKhau && <span className="error-text">{errors.matKhau}</span>}
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Vai trò *</label>
                <select
                  value={formData.vaiTro}
                  onChange={(e) => setFormData({ ...formData, vaiTro: e.target.value })}
                  disabled={isEdit}
                >
                  <option value="QuanTri">Quản trị</option>
                  <option value="QuanLy">Quản lý</option>
                  <option value="LeTan">Lễ tân</option>
                  <option value="BacSi">Bác sĩ</option>
                </select>
              </div>

              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  value={formData.trangThai}
                  onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}
                >
                  <option value="HoatDong">Hoạt động</option>
                  <option value="KhongHoatDong">Không hoạt động</option>
                </select>
              </div>
            </div>

            {/* Thông tin bác sĩ */}
            {formData.vaiTro === 'BacSi' && (
              <>
                <h3>Thông tin bác sĩ</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Số chứng chỉ *</label>
                    <input
                      type="text"
                      value={formData.soChungChi}
                      onChange={(e) => setFormData({ ...formData, soChungChi: e.target.value })}
                      className={errors.soChungChi ? 'error' : ''}
                    />
                    {errors.soChungChi && <span className="error-text">{errors.soChungChi}</span>}
                  </div>

                  <div className="form-group">
                    <label>Cấp học vấn</label>
                    <input
                      type="text"
                      value={formData.capHocVan}
                      onChange={(e) => setFormData({ ...formData, capHocVan: e.target.value })}
                      placeholder="VD: Tiến sĩ, Thạc sĩ..."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Năm kinh nghiệm</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.namKinhNghiem}
                    onChange={(e) => setFormData({ ...formData, namKinhNghiem: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="form-group">
                  <label>Tiểu sử</label>
                  <textarea
                    value={formData.tieuSu}
                    onChange={(e) => setFormData({ ...formData, tieuSu: e.target.value })}
                    rows="3"
                    placeholder="Mô tả về bác sĩ..."
                  />
                </div>

                <div className="form-group">
                  <label>Chuyên khoa</label>
                  <div className="dropdown-chuyenkhoa" style={{ position: 'relative' }}>
                    <select
                      style={{
                        width: '100%',
                        padding: '8px 32px 8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        appearance: 'none',
                        backgroundColor: 'white',
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 8px center',
                        backgroundSize: '20px',
                        color: formData.chuyenKhoaIds.length > 0 ? '#000' : '#999'
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        setDropdownOpen(!dropdownOpen);
                      }}
                      onFocus={() => setDropdownOpen(true)}
                      readOnly
                      value=""
                    >
                      <option value="">
                        {formData.chuyenKhoaIds.length > 0
                          ? `Đã chọn ${formData.chuyenKhoaIds.length} chuyên khoa`
                          : '-- Chọn chuyên khoa --'}
                      </option>
                    </select>
                    {dropdownOpen && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          backgroundColor: 'white',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          marginTop: '2px',
                          maxHeight: '250px',
                          overflowY: 'auto',
                          zIndex: 1000,
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                      >
                        <div
                          style={{
                            padding: '8px 12px',
                            borderBottom: '2px solid #e0e0e0',
                            backgroundColor: '#f8f9fa',
                            fontWeight: '500',
                            color: '#666'
                          }}
                        >
                          -- Chọn chuyên khoa --
                        </div>
                        {chuyenKhoas.map(ck => {
                          const isChecked = formData.chuyenKhoaIds.includes(ck.ChuyenKhoaId);
                          return (
                            <div
                              key={ck.ChuyenKhoaId}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '10px 12px',
                                cursor: 'pointer',
                                backgroundColor: isChecked ? '#e3f2fd' : 'white',
                                userSelect: 'none',
                                transition: 'background-color 0.2s'
                              }}
                              onClick={() => {
                                const newIds = isChecked
                                  ? formData.chuyenKhoaIds.filter(id => id !== ck.ChuyenKhoaId)
                                  : [...formData.chuyenKhoaIds, ck.ChuyenKhoaId];
                                setFormData({ ...formData, chuyenKhoaIds: newIds });
                              }}
                              onMouseEnter={(e) => {
                                if (!isChecked) e.currentTarget.style.backgroundColor = '#f5f5f5';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = isChecked ? '#e3f2fd' : 'white';
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                style={{ 
                                  marginRight: '10px', 
                                  cursor: 'pointer', 
                                  pointerEvents: 'none',
                                  width: '16px',
                                  height: '16px'
                                }}
                              />
                              <span style={{ fontSize: '14px' }}>{ck.TenChuyenKhoa}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {isEdit ? 'Cập nhật' : 'Tạo mới'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleCloseForm}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <p>Đang tải...</p>
        ) : (() => {
          // Filter users theo searchTerm
          const filteredUsers = users.filter(u => {
            if (!searchTerm) return true
            const term = searchTerm.toLowerCase()
            return (
              u.NguoiDung?.HoTen?.toLowerCase().includes(term) ||
              u.NguoiDung?.Email?.toLowerCase().includes(term) ||
              u.NguoiDung?.DienThoai?.includes(term) ||
              u.TenDangNhap?.toLowerCase().includes(term)
            )
          })
          
          return filteredUsers.length === 0 ? (
            <p>{searchTerm ? 'Không tìm thấy người dùng nào' : 'Không có người dùng nào'}</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Họ tên</th>
                  <th>Vai trò</th>
                <th>Điện thoại</th>
                <th>Email</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.TaiKhoanId}>
                  <td>{u.TaiKhoanId}</td>
                  <td>{u.NguoiDung?.HoTen || 'N/A'}</td>
                  <td>
                    <span className={`badge badge-${u.VaiTro === 'QuanTri' ? 'danger' : u.VaiTro === 'QuanLy' ? 'warning' : u.VaiTro === 'BacSi' ? 'success' : 'info'}`}>
                      {u.VaiTro === 'QuanTri' ? 'Quản trị' : u.VaiTro === 'QuanLy' ? 'Quản lý' : u.VaiTro === 'BacSi' ? 'Bác sĩ' : 'Lễ tân'}
                    </span>
                  </td>
                  <td>{u.NguoiDung?.DienThoai || '-'}</td>
                  <td>{u.NguoiDung?.Email || '-'}</td>
                  <td>
                    <span className={`status-badge ${u.TrangThai === 'HoatDong' ? 'status-active' : 'status-inactive'}`}>
                      {u.TrangThai === 'HoatDong' ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-edit btn-success"
                      onClick={() => handleOpenForm(u)}
                      disabled={showForm}
                      title="Cập nhật thông tin"
                    >
                      Cập nhật
                    </button>
                    <button
                      className="btn-edit"
                      onClick={() => handleToggleStatus(u.TaiKhoanId)}
                      disabled={showForm}
                      title={u.TrangThai === 'HoatDong' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      style={{ backgroundColor: u.TrangThai === 'HoatDong' ? '#f44336' : '#4caf50' }}
                    >
                      {u.TrangThai === 'HoatDong' ? 'Khóa' : 'Mở'}
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(u.TaiKhoanId)}
                      disabled={showForm}
                      title="Xóa người dùng"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )
        })()}
      </div>

      <style>{`
        .badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        .badge-danger { background: #ffe0e0; color: #d32f2f; }
        .badge-success { background: #e0f7e9; color: #388e3c; }
        .badge-info { background: #e3f2fd; color: #1976d2; }
        
        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        .status-active { background: #d4edda; color: #155724; }
        .status-inactive { background: #f8d7da; color: #721c24; }
      `}</style>
    </div>
  )
}
