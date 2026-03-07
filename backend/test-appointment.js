const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwidXNlcm5hbWUiOiJ0ZXN0NDU2Iiwicm9sZSI6IkxlVGFuIiwiaWF0IjoxNzcxODQzNTE2LCJleHAiOjE3NzI0NDgzMTZ9.7sqdMWypMWQ34MvmVyA0RMZcityZ_uvou4dad6qlgH8';

const data = JSON.stringify({
  benhNhanId: 1,
  chuyenKhoaId: 1,
  bacSiId: 1,
  thoiGianBatDau: '2026-03-15T09:00:00',
  trieuChung: 'Đau đầu'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/lichkham',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Response:', body);
    }
  });
});

req.on('error', (e) => console.error('Error:', e));
req.write(data);
req.end();
