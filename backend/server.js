const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./models');

// Import routes
const AuthRoutes = require('./routes/AuthRoutes');
const BenhNhanRoutes = require('./routes/BenhNhanRoutes');
const ChuyenKhoaRoutes = require('./routes/ChuyenKhoaRoutes');
const BacSiRoutes = require('./routes/BacSiRoutes');
const LichKhamRoutes = require('./routes/LichKhamRoutes');

// Import middleware
const { authenticateToken } = require('./middleware/AuthMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test API
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Auth Routes (Public)
app.use('/api/auth', AuthRoutes);

// Protected Routes (Cần token)
app.use('/api/benhnhan', authenticateToken, BenhNhanRoutes);
app.use('/api/chuyenkhoa', authenticateToken, ChuyenKhoaRoutes);
app.use('/api/bacsi', authenticateToken, BacSiRoutes);
app.use('/api/lichkham', authenticateToken, LichKhamRoutes);

// Sync database (tạo bảng nếu chưa có)
sequelize.sync({ alter: false })
  .then(() => {
    console.log('✅ Database synced successfully');
  })
  .catch(err => {
    console.error('❌ Error syncing database:', err);
  });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
