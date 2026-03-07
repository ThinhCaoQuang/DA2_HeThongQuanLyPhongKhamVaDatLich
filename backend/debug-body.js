const express = require('express');
const axios = require('axios');

const app = express();

// Log BEFORE middleware
app.use((req, res, next) => {
  console.log('\n[BEFORE MIDDLEWARE] Raw request to:', req.method, req.path);
  console.log('[BEFORE MIDDLEWARE] Headers:', req.headers);
  next();
});

// Apply middlewares exactly like in server.js
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log AFTER middleware
app.use((req, res, next) => {
  console.log('[AFTER JSON MIDDLEWARE] req.body:', JSON.stringify(req.body, null, 2));
  next();
});

// POST endpoint
app.post('/api/bacsi', (req, res) => {
  console.log('\n=== INSIDE ROUTE HANDLER ===');
  console.log('req.body type:', typeof req.body);
  console.log('req.body is:', JSON.stringify(req.body, null, 2));
  
  const { HoTen, SoChungChi } = req.body;
  
  console.log('After destructuring - HoTen:', HoTen);
  console.log('After destructuring - SoChungChi:', SoChungChi);
  
  res.json({
    success: true,
    body_received: req.body,
    hoTen: HoTen,
    soChungChi: SoChungChi
  });
});

const PORT = 5555;
const server = app.listen(PORT, async () => {
  console.log(`🧪 Debug server running on port ${PORT}`);
  console.log('Testing body parsing...\n');
  
  // Give server time to fully start
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    console.log('📤 Sending test request...');
    const response = await axios.post(`http://localhost:${PORT}/api/bacsi`, 
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
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\n📥 Response received:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.hoTen === 'Nguyễn Văn Test') {
      console.log('\n✅ Body parsing is WORKING correctly');
    } else {
      console.log('\n❌ Body parsing is FAILING - values are undefined');
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  } finally {
    server.close();
    process.exit(0);
  }
});
