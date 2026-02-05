import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bacSiAPI } from '../services/api';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import '../styles/BacSi.css';

export default function BacSi() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    hoTen: '',
    soDienThoai: '',
    email: '',
    chuyenMon: '',
    kinh_nghiem: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const response = await bacSiAPI.getAll();
      const data = response.data?.data || response.data || [];
      const doctorsData = Array.isArray(data) ? data : [];
      setDoctors(doctorsData);
      setFilteredDoctors(doctorsData);
    } catch (error) {
      console.error('Lỗi tải danh sách bác sĩ:', error);
      setDoctors([]);
      setFilteredDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === '') {
      setFilteredDoctors(doctors);
    } else {
      const filtered = doctors.filter(doctor =>
        doctor.NguoiDung?.HoTen?.toLowerCase().includes(term) ||
        doctor.ChuyenMon?.toLowerCase().includes(term) ||
        doctor.NguoiDung?.Email?.toLowerCase().includes(term)
      );
      setFilteredDoctors(filtered);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      const newDoctor = {
        hoTen: formData.hoTen,
        soDienThoai: formData.soDienThoai,
        email: formData.email,
        chuyenMon: formData.chuyenMon,
        kinh_nghiem: parseInt(formData.kinh_nghiem) || 0
      };

      if (editingId) {
        await bacSiAPI.update(editingId, newDoctor);
      } else {
        await bacSiAPI.create(newDoctor);
      }

      setFormData({
        hoTen: '',
        soDienThoai: '',
        email: '',
        chuyenMon: '',
        kinh_nghiem: ''
      });
      setEditingId(null);
      setShowForm(false);
      loadDoctors();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditDoctor = (doctor) => {
    setEditingId(doctor.BacSiId);
    setFormData({
      hoTen: doctor.NguoiDung?.HoTen || '',
      soDienThoai: doctor.NguoiDung?.DienThoai || '',
      email: doctor.NguoiDung?.Email || '',
      chuyenMon: doctor.ChuyenMon || '',
      kinh_nghiem: doctor.KinhNghiem || ''
    });
    setShowForm(true);
  };

  const handleDeleteDoctor = async (id) => {
    if (window.confirm('Bạn chắc chắn muốn xóa bác sĩ này?')) {
      try {
        await bacSiAPI.delete(id);
        loadDoctors();
      } catch (error) {
        alert('Lỗi xóa bác sĩ: ' + error.message);
      }
    }
  };

  const handleCancelForm = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      hoTen: '',
      soDienThoai: '',
      email: '',
      chuyenMon: '',
    });
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <h1>Quản Lý Bác Sĩ</h1>
        </div>

        <section className="content-section">
          <div className="section-header">
            <h2>Danh Sách Bác Sĩ</h2>
            <div className="header-actions">
              <input
                type="text"
                placeholder="Tìm kiếm bác sĩ..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
              <button 
                onClick={() => setShowForm(!showForm)} 
                className="btn-add"
              >
                {showForm ? 'Đóng' : '+ Thêm Bác Sĩ'}
              </button>
            </div>
          </div>

          {showForm && (
            <form onSubmit={handleAddDoctor} className="add-doctor-form">
              <div className="form-group">
                <label>Họ Tên</label>
                <input
                  type="text"
                  name="hoTen"
                  value={formData.hoTen}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Số Điện Thoại</label>
                <input
                  type="text"
                  name="soDienThoai"
                  value={formData.soDienThoai}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label>Chuyên Môn</label>
                <input
                  type="text"
                  name="chuyenMon"
                  value={formData.chuyenMon}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label>Kinh Nghiệm (năm)</label>
                <input
                  type="number"
                  name="kinh_nghiem"
                  value={formData.kinh_nghiem}
                  onChange={handleFormChange}
                  min="0"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingId ? 'Cập Nhật' : 'Thêm Bác Sĩ'}
                </button>
                <button 
                  type="button" 
                  onClick={handleCancelForm}
                  className="btn-cancel"
                >
                  Hủy
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <Loading />
          ) : filteredDoctors.length === 0 ? (
            <p>{searchTerm ? 'Không tìm thấy bác sĩ phù hợp' : 'Không có bác sĩ nào'}</p>
          ) : (
            <table className="doctors-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Họ Tên</th>
                  <th>Số Điện Thoại</th>
                  <th>Email</th>
                  <th>Chuyên Môn</th>
                  <th>Kinh Nghiệm</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor, index) => (
                  <tr key={doctor.BacSiId}>
                    <td>{index + 1}</td>
                    <td>{doctor.NguoiDung?.HoTen}</td>
                    <td>{doctor.NguoiDung?.DienThoai}</td>
                    <td>{doctor.NguoiDung?.Email}</td>
                    <td>{doctor.ChuyenMon}</td>
                    <td>{doctor.KinhNghiem} năm</td>
                    <td>
                      <button 
                        onClick={() => handleEditDoctor(doctor)}
                        className="btn-edit"
                      >
                        Sửa
                      </button>
                      <button 
                        onClick={() => handleDeleteDoctor(doctor.BacSiId)}
                        className="btn-delete"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </Layout>
  );
}
