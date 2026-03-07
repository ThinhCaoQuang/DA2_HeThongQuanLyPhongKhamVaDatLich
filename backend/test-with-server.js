// Start server and run test
const { spawn } = require('child_process');
const fs = require('fs');
const axios = require('axios');

// Start server and capture output
const server = spawn('node', ['server.js'], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe']
});

let output = '';
let errors = '';

server.stdout.on('data', (data) => {
  output += data.toString();
  console.log('[SERVER]', data.toString().trim());
});

server.stderr.on('data', (data) => {
  errors += data.toString();
  console.error('[SERVER ERROR]', data.toString().trim());
});

// Wait for server to start, then run test
setTimeout(async () => {
  console.log('\n' + '='.repeat(50));
  console.log('RUNNING TEST');
  console.log('='.repeat(50) + '\n');
  
  try {
    // First login
    console.log('📤 Logging in...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'Admin@123'
    });
    
    const token = loginRes.data.data.token;
    console.log('✅ Logged in, token:', token.substring(0, 20) + '...');
    
    // Now create doctor
    console.log('\n📤 Creating doctor...');
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
    
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    const createRes = await axios.post('http://localhost:5000/api/bacsi', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('\n✅ Response:', JSON.stringify(createRes.data, null, 2));
    
  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
  } finally {
    // Print all server output
    console.log('\n' + '='.repeat(50));
    console.log('SERVER OUTPUT');
    console.log('='.repeat(50));
    console.log(output);
    if (errors) {
      console.log('\nSERVER ERRORS:');
      console.log(errors);
    }
    
    server.kill();
    process.exit(0);
  }
}, 3000);
