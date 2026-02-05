import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { lichKhamAPI, benhNhanAPI, bacSiAPI } from '../services/api';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import '../styles/LichKham.css';

export default function LichKham() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    maBenhNhan: '',
    maBacSi: '',
    ngayKham: '',
    gioKham: '',
    lyDoKham: '',
    trangThai: 'Đã đặt'
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAppointments(),
        loadPatients(),
        loadDoctors()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const response = await lichKhamAPI.getAll();
      const data = response.data?.data || response.data || [];
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Lỗi tải lịch khám:', error);
      setAppointments([]);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await benhNhanAPI.getAll();
      const data = response.data?.data || response.data || [];
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Lỗi tải bệnh nhân:', error);
      setPatients([]);
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await bacSiAPI.getAll();
      const data = response.data?.data || response.data || [];
      setDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Lỗi tải bác sĩ:', error);
      setDoctors([]);
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
      const submitData = {
        ...formData,
        ngayGioKham: `${formData.ngayKham} ${formData.gioKham}:00`
      };
      
      if (editingId) {
        await lichKhamAPI.update(editingId, submitData);
      } else {
        await lichKhamAPI.create(submitData);
      }
      await loadAppointments();
      handleCancelForm();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditAppointment = (appointment) => {
    const ngayGioKham = new Date(appointment.NgayGioKham);
    const ngayKham = ngayGioKham.toISOString().split('T')[0];
    const gioKham = ngayGioKham.toTimeString().split(':').slice(0, 2).join(':');

    setEditingId(appointment.MaLichKham);
    setFormData({
      maBenhNhan: appointment.MaBenhNhan || '',
      maBacSi: appointment.MaBacSi || '',
      ngayKham: ngayKham,
      gioKham: gioKham,
      lyDoKham: appointment.LyDoKham || '',
      trangThai: appointment.TrangThai || 'Đã đặt'
    });
    setShowForm(true);
  };

  const handleDeleteAppointment = async (id) => {
    if (window.confirm('Bạn chắc chắn muốn xóa lịch khám này?')) {
      try {
        await lichKhamAPI.delete(id);
        await loadAppointments();
      } catch (error) {
        alert('Lỗi xóa lịch khám: ' + error.message);
      }
    }
  };

  const handleConfirmAppointment = async (id) => {
    if (window.confirm('Xác nhận lịch khám này?')) {
      try {
        await lichKhamAPI.confirm(id);
        await loadAppointments();
      } catch (error) {
        alert('Lỗi xác nhận: ' + error.message);
      }
    }
  };

  const handleCancelAppointment = async (id) => {
    if (window.confirm('Hủy lịch khám này?')) {
      try {
        await lichKhamAPI.cancel(id);
        await loadAppointments();
      } catch (error) {
        alert('Lỗi hủy lịch: ' + error.message);
      }
    }
  };

  const handleCancelForm = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      maBenhNhan: '',
      maBacSi: '',
      ngayKham: '',
      gioKham: '',
      lyDoKham: '',
      trangThai: 'Đã đặt'
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Đã xác nhận':
        return 'status-confirmed';
      case 'Đã hủy':
        return 'status-cancelled';
      case 'Hoàn thành':
        return 'status-completed';
      default:
        return 'status-pending';
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <h1>Quản Lý Lịch Khám</h1>
        </div>

        <section className="content-section">
          <div className="section-header">
            <h2>Danh Sách Lịch Khám</h2>
            <button 
              onClick={() => setShowForm(!showForm)} 
              className="btn-add"
            >
              {showForm ? 'Đóng' : '+ Đặt Lịch Khám'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="appointment-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Bệnh Nhân *</label>
                  <select
                    name="maBenhNhan"
                    value={formData.maBenhNhan}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn bệnh nhân</option>
                    {patients.map((patient) => (
                      <option key={patient.MaBenhNhan} value={patient.MaBenhNhan}>
                        {patient.NguoiDung?.HoTen || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Bác Sĩ *</label>
                  <select
                    name="maBacSi"
                    value={formData.maBacSi}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn bác sĩ</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.MaBacSi} value={doctor.MaBacSi}>
                        {doctor.NguoiDung?.HoTen || 'N/A'} - {doctor.ChuyenMon}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Ngày Khám *</label>
                  <input
                    type="date"
                    name="ngayKham"
                    value={formData.ngayKham}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Giờ Khám *</label>
                  <input
                    type="time"
                    name="gioKham"
                    value={formData.gioKham}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Trạng Thái</label>
                  <select
                    name="trangThai"
                    value={formData.trangThai}
                    onChange={handleInputChange}
                  >
                    <option value="Đã đặt">Đã đặt</option>
                    <option value="Đã xác nhận">Đã xác nhận</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                    <option value="Đã hủy">Đã hủy</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Lý Do Khám</label>
                  <textarea
                    name="lyDoKham"
                    value={formData.lyDoKham}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Nhập lý do khám bệnh..."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingId ? 'Cập Nhật' : 'Đặt Lịch'}
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
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Bệnh Nhân</th>
                    <th>Bác Sĩ</th>
                    <th>Ngày Giờ Khám</th>
                    <th>Lý Do</th>
                    <th>Trạng Thái</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.MaLichKham}>
                      <td>{appointment.MaLichKham}</td>
                      <td className="patient-name">
                        {appointment.BenhNhan?.NguoiDung?.HoTen || 'N/A'}
                      </td>
                      <td className="doctor-name">
                        {appointment.BacSi?.NguoiDung?.HoTen || 'N/A'}
                      </td>
                      <td className="datetime">
                        {formatDateTime(appointment.NgayGioKham)}
                      </td>
                      <td className="reason">
                        {appointment.LyDoKham || '—'}
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(appointment.TrangThai)}`}>
                          {appointment.TrangThai}
                        </span>
                      </td>
                      <td className="actions">
                        {appointment.TrangThai === 'Đã đặt' && (
                          <button
                            onClick={() => handleConfirmAppointment(appointment.MaLichKham)}
                            className="btn-confirm"
                            title="Xác nhận"
                          >
                            ✓
                          </button>
                        )}
                        {(appointment.TrangThai === 'Đã đặt' || appointment.TrangThai === 'Đã xác nhận') && (
                          <button
                            onClick={() => handleCancelAppointment(appointment.MaLichKham)}
                            className="btn-cancel-appointment"
                            title="Hủy lịch"
                          >
                            ✕
                          </button>
                        )}
                        <button
                          onClick={() => handleEditAppointment(appointment)}
                          className="btn-edit"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteAppointment(appointment.MaLichKham)}
                          className="btn-delete"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
