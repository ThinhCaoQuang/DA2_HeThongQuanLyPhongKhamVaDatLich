const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./models');

// Import routes
const AuthRoutes = require('./routes/AuthRoutes');
const BenhNhanRoutes = require('./routes/BenhNhanRoutes');
const BacSiRoutes = require('./routes/BacSiRoutes');
const ChuyenKhoaRoutes = require('./routes/ChuyenKhoaRoutes');
const LichKhamRoutes = require('./routes/LichKhamRoutes');
const LichLamViecBacSiRoutes = require('./routes/LichLamViecBacSiRoutes');
const HoSoKhamBenhRoutes = require('./routes/HoSoKhamBenhRoutes');
const DonThuocRoutes = require('./routes/DonThuocRoutes');
const DashboardRoutes = require('./routes/DashboardRoutes');
const ThongBaoRoutes = require('./routes/ThongBaoRoutes');
const SpecialtyRecommendationRoutes = require('./routes/SpecialtyRecommendationRoutes');
const SchedulerRoutes = require('./routes/SchedulerRoutes');
const UserManagementRoutes = require('./routes/UserManagementRoutes');
const NotificationScheduler = require('./services/NotificationScheduler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test API route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend API is working!' });
});

// Register API routes
app.use('/api/auth', AuthRoutes);
app.use('/api/benhnhan', BenhNhanRoutes);
app.use('/api/bacsi', BacSiRoutes);
app.use('/api/chuyenkhoa', ChuyenKhoaRoutes);
app.use('/api/lichkham', LichKhamRoutes);
app.use('/api/lichlamviec', LichLamViecBacSiRoutes);
app.use('/api/hosokhambenh', HoSoKhamBenhRoutes);
app.use('/api/donthuoc', DonThuocRoutes);
app.use('/api/dashboard', DashboardRoutes);
app.use('/api/thongbao', ThongBaoRoutes);
app.use('/api/specialty-recommendation', SpecialtyRecommendationRoutes);
app.use('/api/scheduler', SchedulerRoutes);
app.use('/api/users', UserManagementRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Đường dẫn API không tồn tại'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi máy chủ',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Database connection and start server
sequelize.authenticate()
  .then(() => {
    console.log('Database connection successful');
    
    // Khởi động notification scheduler
    NotificationScheduler.startDailyReminders();
    
    // Start server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`\nAvailable endpoints:\n`);
      
      console.log(`Authentication:`);
      console.log(`  POST   /api/auth/login`);
      console.log(`  POST   /api/auth/register`);
      console.log(`  GET    /api/auth/me (protected)`);
      console.log(`  POST   /api/auth/change-password (protected)`);
      
      console.log(`\nBệnh Nhân (Patient Management)`);
      console.log(`  GET    /api/benhnhan (protected - LeTan/QuanTri)`);
      console.log(`  GET    /api/benhnhan/:id (protected - LeTan/QuanTri)`);
      console.log(`  POST   /api/benhnhan (protected - LeTan/QuanTri)`);
      console.log(`  PUT    /api/benhnhan/:id (protected - LeTan/QuanTri)`);
      console.log(`  DELETE /api/benhnhan/:id (protected - LeTan/QuanTri)`);
      
      console.log(`\nBác Sĩ (Doctor Management)`);
      console.log(`  GET    /api/bacsi (protected - LeTan/QuanTri)`);
      console.log(`  GET    /api/bacsi/:id (protected - LeTan/QuanTri)`);
      console.log(`  POST   /api/bacsi (protected - LeTan/QuanTri)`);
      console.log(`  PUT    /api/bacsi/:id (protected - LeTan/QuanTri)`);
      console.log(`  POST   /api/bacsi/:id/specialty (protected - LeTan/QuanTri)`);
      
      console.log(`\nChuyên Khoa (Specialty Management)`);
      console.log(`  GET    /api/chuyenkhoa (protected - all)`);
      console.log(`  GET    /api/chuyenkhoa/:id (protected - all)`);
      console.log(`  POST   /api/chuyenkhoa (protected - QuanTri)`);
      console.log(`  PUT    /api/chuyenkhoa/:id (protected - QuanTri)`);
      console.log(`  DELETE /api/chuyenkhoa/:id (protected - QuanTri)`);
      
      console.log(`\nLịch Khám (Appointment Management)`);
      console.log(`  GET    /api/lichkham (protected - LeTan/QuanTri)`);
      console.log(`  GET    /api/lichkham/:id (protected - LeTan/QuanTri/BacSi)`);
      console.log(`  POST   /api/lichkham (protected - LeTan/QuanTri)`);
      console.log(`  POST   /api/lichkham/:id/confirm (protected - LeTan/QuanTri)`);
      console.log(`  POST   /api/lichkham/:id/cancel (protected - LeTan/QuanTri)`);
      console.log(`  POST   /api/lichkham/:id/complete (protected - BacSi)`);
      
      console.log(`\nLịch Làm Việc (Doctor Schedule)`);
      console.log(`  GET    /api/lichlamviec (protected - LeTan/QuanTri)`);
      console.log(`  GET    /api/lichlamviec/:id (protected - LeTan/QuanTri)`);
      console.log(`  POST   /api/lichlamviec (protected - LeTan/QuanTri)`);
      console.log(`  PUT    /api/lichlamviec/:id (protected - LeTan/QuanTri)`);
      console.log(`  DELETE /api/lichlamviec/:id (protected - LeTan/QuanTri)`);
      
      console.log(`\nHồ Sơ Khám Bệnh (Medical Records)`);
      console.log(`  GET    /api/hosokhambenh (protected - all)`);
      console.log(`  GET    /api/hosokhambenh/:id (protected - all)`);
      console.log(`  POST   /api/hosokhambenh (protected - BacSi/LeTan/QuanTri)`);
      console.log(`  PUT    /api/hosokhambenh/:id (protected - BacSi/LeTan/QuanTri)\n`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

module.exports = app;
