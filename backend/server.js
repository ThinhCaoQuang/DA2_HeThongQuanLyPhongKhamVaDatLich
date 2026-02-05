const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./models');

// Import routes
const BenhNhanRoutes = require('./routes/BenhNhanRoutes');
const ChuyenKhoaRoutes = require('./routes/ChuyenKhoaRoutes');
const BacSiRoutes = require('./routes/BacSiRoutes');
const LichKhamRoutes = require('./routes/LichKhamRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test API
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// API Routes
app.use('/api/benhnhan', BenhNhanRoutes);
app.use('/api/chuyenkhoa', ChuyenKhoaRoutes);
app.use('/api/bacsi', BacSiRoutes);
app.use('/api/lichkham', LichKhamRoutes);

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
