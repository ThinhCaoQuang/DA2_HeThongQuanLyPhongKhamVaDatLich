import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { benhNhanAPI, authAPI } from '../services/api';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    hoTen: '',
    soDienThoai: '',
    email: '',
    diaChi: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await benhNhanAPI.getAll();
      const data = response.data?.data || response.data || [];
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Lỗi tải danh sách bệnh nhân:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      await benhNhanAPI.create(formData);
      setFormData({ hoTen: '', soDienThoai: '', email: '', diaChi: '' });
      setShowForm(false);
      loadPatients();
    } catch (error) {
      alert('Lỗi thêm bệnh nhân: ' + error.response?.data?.message);
    }
  };

  const handleDeletePatient = async (id) => {
    if (window.confirm('Bạn chắc chắn muốn xóa?')) {
      try {
        await benhNhanAPI.delete(id);
        loadPatients();
      } catch (error) {
        alert('Lỗi xóa bệnh nhân');
      }
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard - Quản Lý Bệnh Nhân</h1>
        <div className="user-info">
          <span>Xin chào: {user?.HoTen}</span>
          <button onClick={() => navigate('/bacsi')} className="btn-nav">Quản Lý Bác Sĩ</button>
          <button onClick={handleLogout} className="btn-logout">Đăng Xuất</button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="patients-section">
          <div className="section-header">
            <h2>Danh Sách Bệnh Nhân</h2>
            <button 
              onClick={() => setShowForm(!showForm)} 
              className="btn-add"
            >
              {showForm ? 'Đóng' : '+ Thêm Bệnh Nhân'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAddPatient} className="add-patient-form">
              <div className="form-group">
                <label>Họ Tên</label>
                <input
                  type="text"
                  value={formData.hoTen}
                  onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Số Điện Thoại</label>
                <input
                  type="text"
                  value={formData.soDienThoai}
                  onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
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
              <div className="form-group">
                <label>Địa Chỉ</label>
                <input
                  type="text"
                  value={formData.diaChi}
                  onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                />
              </div>
              <button type="submit" className="btn-submit">Thêm Bệnh Nhân</button>
            </form>
          )}

          {loading ? (
            <p>Đang tải...</p>
          ) : patients.length === 0 ? (
            <p>Không có bệnh nhân nào</p>
          ) : (
            <table className="patients-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Họ Tên</th>
                  <th>Số Điện Thoại</th>
                  <th>Email</th>
                  <th>Địa Chỉ</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient, index) => (
                  <tr key={patient.BenhNhanId}>
                    <td>{index + 1}</td>
                    <td>{patient.HoTen}</td>
                    <td>{patient.SoDienThoai}</td>
                    <td>{patient.Email}</td>
                    <td>{patient.DiaChi}</td>
                    <td>
                      <button 
                        onClick={() => handleDeletePatient(patient.BenhNhanId)}
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
      </main>
    </div>
  );
}
