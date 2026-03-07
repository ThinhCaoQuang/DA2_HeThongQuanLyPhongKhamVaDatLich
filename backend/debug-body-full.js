const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();

// EXACT middleware from server.js
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware - EXACT from server.js
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (['POST', 'PUT'].includes(req.method)) {
    console.log('  Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Auth middleware - matching server structure
const AuthMiddleware = {
  verifyToken: (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ success: false, message: 'Token tidak diberikan' });
      }
      // For testing, just pass through without verifying
      req.user = { id: 1, role: 'QuanTri' };
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Token tidak valid' });
    }
  },
  checkRole: (roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Tidak terautentikasi' });
      }
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Tidak memiliki izin' });
      }
      next();
    };
  }
};

// Create router EXACTLY like BacSiRoutes
const router = express.Router();

// All routes require authentication
router.use(AuthMiddleware.verifyToken);

// The create endpoint
router.post('/', AuthMiddleware.checkRole(['QuanTri']), (req, res) => {
  console.log('\n=== INSIDE ROUTE HANDLER ===');
  console.log('req.body type:', typeof req.body);
  console.log('req.body:', JSON.stringify(req.body, null, 2));
  
  const { HoTen, SoChungChi } = req.body;
  
  console.log('After destructuring - HoTen:', HoTen);
  console.log('After destructuring - SoChungChi:', SoChungChi);
  
  if (!HoTen || !SoChungChi) {
    console.log('❌ VALIDATION FAILED');
    return res.status(400).json({
      success: false,
      message: 'Họ tên và số chứng chỉ không được để trống'
    });
  }
  
  res.status(201).json({
    success: true,
    body_received: req.body,
    hoTen: HoTen,
    soChungChi: SoChungChi
  });
});

app.use('/api/bacsi', router);

const PORT = 5556;
const server = app.listen(PORT, async () => {
  console.log(`🧪 Debug server (with all middleware) running on port ${PORT}`);
  console.log('Testing body parsing with full middleware stack...\n');
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    console.log('📤 Sending test request...');
    const response = await axios.post(
      `http://localhost:${PORT}/api/bacsi`,
      {
        HoTen: 'Nguyễn Văn Test',
        DienThoai: '0987654321',
        Email: 'test.doctor@example.com',
        DiaChi: '123 Test Street',
        SoChungChi: 'CC1772108342477',
        ChuyenKhoaId: 1,
        CapHocVan: 'ThacSi',
        NamKinhNghiem: 5
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-token'
        }
      }
    );
    
    console.log('\n📥 Response received:');
    console.log('Status:', response.status);
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.hoTen === 'Nguyễn Văn Test') {
      console.log('\n✅ Body parsing is WORKING with full middleware');
    } else {
      console.log('\n❌ Body parsing FAILED with full middleware');
    }
    
  } catch (error) {
    console.error('\n❌ Error during test:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
  } finally {
    server.close();
    process.exit(0);
  }
});
