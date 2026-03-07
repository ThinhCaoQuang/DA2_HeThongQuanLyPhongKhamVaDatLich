const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();
const { sequelize } = require('./models');

// Setup file logging
const logFile = path.join(__dirname, 'debug.log');
fs.writeFileSync(logFile, '=== SERVER DEBUG LOG ===\n');

function log(msg) {
  const timestamp = new Date().toISOString();
  const logMsg = `[${timestamp}] ${msg}\n`;
  fs.appendFileSync(logFile, logMsg);
  console.log(logMsg);
}

log('🚀 Starting server...');

const app = express();

// Middleware
log('ℹ️ Applying middleware...');
app.use(cors());
log('✓ CORS configured');

app.use(express.json());
log('✓ express.json() configured');

app.use(express.urlencoded({ extended: true }));
log('✓ express.urlencoded() configured');

// Request logging middleware
app.use((req, res, next) => {
  const msg = `${new Date().toISOString()} - ${req.method} ${req.path}`;
  log(msg);
  if (['POST', 'PUT'].includes(req.method)) {
    log('  Body: ' + JSON.stringify(req.body, null, 2));
  }
  next();
});

// Test API route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend API is working!' });
});

// Import routes
const AuthRoutes = require('./routes/AuthRoutes');
const BacSiRoutes = require('./routes/BacSiRoutes');

// Register API routes
app.use('/api/auth', AuthRoutes);

// Wrap BacSiRoutes to add logging
const wrappedBacSiRoutes = express.Router();
wrappedBacSiRoutes.use((req, res, next) => {
  log('📍 Entered BacSiRoutes');
  next();
});
wrappedBacSiRoutes.use(BacSiRoutes);
app.use('/api/bacsi', wrappedBacSiRoutes);

log('ℹ️ Routes registered');

// Connect and start
sequelize.authenticate()
  .then(() => {
    log('✓ Database connection successful');
    
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      log(`✓ Server running on port ${PORT}`);
      
      // Run test
      setTimeout(async () => {
        log('\n=== STARTING TEST ===');
        try {
          log('📤 Logging in...');
          const loginRes = await axios.post(`http://localhost:${PORT}/api/auth/login`, {
            username: 'admin',
            password: 'Admin@123'
          });
          
          const token = loginRes.data.data.token;
          log('✅ Login successful');
          
          log('📤 Creating doctor...');
          const payload = {
            HoTen: 'Test Doctor',
            SoChungChi: 'CC' + Date.now(),
            DienThoai: '0987654321',
            Email: 'test@example.com',
            DiaChi: 'Test Address',
            ChuyenKhoaId: 1,
            CapHocVan: 'ThacSi',
            NamKinhNghiem: 5
          };
          
          log('Payload: ' + JSON.stringify(payload, null, 2));
          
          const createRes = await axios.post(`http://localhost:${PORT}/api/bacsi`, payload, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          log('✅ Doctor created successfully');
          log('Response: ' + JSON.stringify(createRes.data, null, 2));
          
        } catch (error) {
          log('❌ Error: ' + (error.response?.data?.message || error.message));
          log('Full error: ' + JSON.stringify(error.response?.data, null, 2));
        } finally {
          log('\n=== TEST COMPLETE - Check ' + logFile + ' ===');
          server.close();
          process.exit(0);
        }
      }, 1000);
    });
  })
  .catch((err) => {
    log('❌ Database connection error: ' + err.message);
    process.exit(1);
  });
