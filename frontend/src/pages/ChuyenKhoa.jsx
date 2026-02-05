import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chuyenKhoaAPI } from '../services/api';
import Layout from '../components/Layout';
import '../styles/ChuyenKhoa.css';

export default function ChuyenKhoa() {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState([]);
  const [filteredSpecialties, setFilteredSpecialties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    tenChuyenKhoa: '',
    moTa: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    loadSpecialties();
  }, []);

  const loadSpecialties = async () => {
    try {
      setLoading(true);
      const response = await chuyenKhoaAPI.getAll();
      const data = response.data?.data || response.data || [];
      const specialtiesData = Array.isArray(data) ? data : [];
      setSpecialties(specialtiesData);
      setFilteredSpecialties(specialtiesData);
    } catch (error) {
      console.error('Lỗi tải danh sách chuyên khoa:', error);
      setSpecialties([]);
      setFilteredSpecialties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === '') {
      setFilteredSpecialties(specialties);
    } else {
      const filtered = specialties.filter(specialty =>
        specialty.TenChuyenKhoa?.toLowerCase().includes(term) ||
        specialty.MoTa?.toLowerCase().includes(term)
      );
      setFilteredSpecialties(filtered);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await chuyenKhoaAPI.update(editingId, formData);
      } else {
        await chuyenKhoaAPI.create(formData);
      }
      loadSpecialties();
      handleCancelForm();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditSpecialty = (specialty) => {
    setEditingId(specialty.MaChuyenKhoa);
    setFormData({
      tenChuyenKhoa: specialty.TenChuyenKhoa || '',
      moTa: specialty.MoTa || ''
    });
    setShowForm(true);
  };

  const handleDeleteSpecialty = async (id) => {
    if (window.confirm('Bạn chắc chắn muốn xóa chuyên khoa này?')) {
      try {
        await chuyenKhoaAPI.delete(id);
        loadSpecialties();
      } catch (error) {
        alert('Lỗi xóa chuyên khoa: ' + error.message);
      }
    }
  };

  const handleCancelForm = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      tenChuyenKhoa: '',
      moTa: ''
    });
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <h1>Quản Lý Chuyên Khoa</h1>
        </div>

        <section className="content-section">
          <div className="section-header">
            <h2>Danh Sách Chuyên Khoa</h2>
            <div className="header-actions">
              <input
                type="text"
                placeholder="🔍 Tìm kiếm chuyên khoa..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
              <button 
                onClick={() => setShowForm(!showForm)} 
                className="btn-add"
              >
                {showForm ? 'Đóng' : '+ Thêm Chuyên Khoa'}
              </button>
            </div>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="specialty-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Tên Chuyên Khoa *</label>
                  <input
                    type="text"
                    name="tenChuyenKhoa"
                    value={formData.tenChuyenKhoa}
                    onChange={handleInputChange}
                    required
                    placeholder="VD: Tim mạch, Nội khoa, Nhi..."
                  />
                </div>

                <div className="form-group full-width">
                  <label>Mô Tả</label>
                  <textarea
                    name="moTa"
                    value={formData.moTa}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Nhập mô tả về chuyên khoa..."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingId ? 'Cập Nhật' : 'Thêm Mới'}
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
            <div className="loading">Đang tải dữ liệu...</div>
          ) : filteredSpecialties.length === 0 ? (
            <p>{searchTerm ? 'Không tìm thấy chuyên khoa phù hợp' : 'Không có chuyên khoa nào'}</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Tên Chuyên Khoa</th>
                  <th>Mô Tả</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredSpecialties.map((specialty) => (
                  <tr key={specialty.MaChuyenKhoa}>
                    <td>{specialty.MaChuyenKhoa}</td>
                    <td className="specialty-name">{specialty.TenChuyenKhoa}</td>
                    <td className="description">{specialty.MoTa || '—'}</td>
                    <td className="actions">
                      <button
                        onClick={() => handleEditSpecialty(specialty)}
                        className="btn-edit"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteSpecialty(specialty.MaChuyenKhoa)}
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
