import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { benhNhanAPI, bacSiAPI, lichKhamAPI } from '../services/api';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    todayAppointments: 0,
    confirmedAppointments: 0
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
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
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadPatients(),
      loadStatistics(),
      loadUpcomingAppointments()
    ]);
    setLoading(false);
  };

  const loadStatistics = async () => {
    try {
      const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
        benhNhanAPI.getAll(),
        bacSiAPI.getAll(),
        lichKhamAPI.getAll()
      ]);

      const patientsData = patientsRes.data?.data || patientsRes.data || [];
      const doctorsData = doctorsRes.data?.data || doctorsRes.data || [];
      const appointmentsData = appointmentsRes.data?.data || appointmentsRes.data || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayAppts = appointmentsData.filter(apt => {
        const aptDate = new Date(apt.NgayGioKham);
        return aptDate >= today && aptDate < tomorrow;
      });

      const confirmedAppts = appointmentsData.filter(apt => 
        apt.TrangThai === 'Đã xác nhận'
      );

      setStats({
        totalPatients: patientsData.length,
        totalDoctors: doctorsData.length,
        todayAppointments: todayAppts.length,
        confirmedAppointments: confirmedAppts.length
      });
    } catch (error) {
      console.error('Lỗi tải thống kê:', error);
    }
  };

  const loadUpcomingAppointments = async () => {
    try {
      const response = await lichKhamAPI.getAll();
      const data = response.data?.data || response.data || [];
      
      const now = new Date();
      const upcoming = data
        .filter(apt => new Date(apt.NgayGioKham) >= now)
        .sort((a, b) => new Date(a.NgayGioKham) - new Date(b.NgayGioKham))
        .slice(0, 5);
      
      setUpcomingAppointments(upcoming);
    } catch (error) {
      console.error('Lỗi tải lịch khám sắp tới:', error);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await benhNhanAPI.getAll();
      const data = response.data?.data || response.data || [];
      const patientsData = Array.isArray(data) ? data : [];
      setPatients(patientsData);
      setFilteredPatients(patientsData);
    } catch (error) {
      console.error('Lỗi tải danh sách bệnh nhân:', error);
      setPatients([]);
      setFilteredPatients([]);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient =>
        patient.NguoiDung?.HoTen?.toLowerCase().includes(term) ||
        patient.NguoiDung?.DienThoai?.toLowerCase().includes(term) ||
        patient.NguoiDung?.Email?.toLowerCase().includes(term)
      );
      setFilteredPatients(filtered);
    }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      await benhNhanAPI.create(formData);
      setFormData({ hoTen: '', soDienThoai: '', email: '', diaChi: '' });
      setShowForm(false);
      await loadAllData();
    } catch (error) {
      alert('Lỗi thêm bệnh nhân: ' + error.response?.data?.message);
    }
  };

  const handleDeletePatient = async (id) => {
    if (window.confirm('Bạn chắc chắn muốn xóa?')) {
      try {
        await benhNhanAPI.delete(id);
        await loadAllData();
      } catch (error) {
        alert('Lỗi xóa bệnh nhân');
      }
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      {loading ? (
        <Loading />
      ) : (
      <div className="page-container">
        <div className="page-header">
          <h1>Dashboard</h1>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card patients">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{stats.totalPatients}</h3>
              <p>Tổng Bệnh Nhân</p>
            </div>
          </div>

          <div className="stat-card doctors">
            <div className="stat-icon">👨‍⚕️</div>
            <div className="stat-info">
              <h3>{stats.totalDoctors}</h3>
              <p>Tổng Bác Sĩ</p>
            </div>
          </div>

          <div className="stat-card today">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>{stats.todayAppointments}</h3>
              <p>Lịch Khám Hôm Nay</p>
            </div>
          </div>

          <div className="stat-card confirmed">
            <div className="stat-icon">✓</div>
            <div className="stat-info">
              <h3>{stats.confirmedAppointments}</h3>
              <p>Đã Xác Nhận</p>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <div className="upcoming-section">
            <h2>Lịch Khám Sắp Tới</h2>
            <div className="upcoming-list">
              {upcomingAppointments.map((apt) => (
                <div key={apt.MaLichKham} className="upcoming-item">
                  <div className="upcoming-time">
                    {formatDateTime(apt.NgayGioKham)}
                  </div>
                  <div className="upcoming-details">
                    <strong>{apt.BenhNhan?.NguoiDung?.HoTen || 'N/A'}</strong>
                    <span> - {apt.BacSi?.NguoiDung?.HoTen || 'N/A'}</span>
                  </div>
                  <div className={`upcoming-status status-${apt.TrangThai?.toLowerCase().replace(/\s/g, '-')}`}>
                    {apt.TrangThai}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="page-header">
          <h2>Quản Lý Bệnh Nhân</h2>
        </div>

        <section className="content-section">
          <div className="section-header">
            <h2>Danh Sách Bệnh Nhân</h2>
            <div className="header-actions">
              <input
                type="text"
                placeholder="Tìm kiếm bệnh nhân..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
              <button 
                onClick={() => setShowForm(!showForm)} 
                className="btn-add"
              >
                {showForm ? 'Đóng' : '+ Thêm Bệnh Nhân'}
              </button>
            </div>
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
          ) : filteredPatients.length === 0 ? (
            <p>{searchTerm ? 'Không tìm thấy bệnh nhân phù hợp' : 'Không có bệnh nhân nào'}</p>
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
                {filteredPatients.map((patient, index) => (
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
      </div>
      )}
    </Layout>
  );
}
