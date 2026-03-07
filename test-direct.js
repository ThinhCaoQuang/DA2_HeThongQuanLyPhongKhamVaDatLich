// Test request directly from here to see backend logs clearly
const http = require('http');
const JWT_SECRET = 'clinic-system-secret-key-2026';
const jwt = require('jsonwebtoken');

// Generate a valid admin token
const token = jwt.sign(
  { id: 17, username: 'admin', role: 'QuanTri' },
  JWT_SECRET,
  { expiresIn: '7d' }
);

const postData = JSON.stringify({
  HoTen: 'Test Doctor Direct',
  SoChungChi: 'DIRECT' + Date.now(),
  DienThoai: '0123456789',
  Email: 'direct@test.com',
  DiaChi: 'Direct Address',
  CapHocVan: 'ThacSi',
  NamKinhNghiem: 5,
  ChuyenKhoaId: 1
});

console.log('Sending POST request to /api/bacsi');
console.log('Token:', token.substring(0, 50) + '...');
console.log('Payload:', postData);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/bacsi',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('\nResponse Status:', res.statusCode);
      console.log('Response:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

console.log('\nSending...');
req.write(postData);
req.end();
