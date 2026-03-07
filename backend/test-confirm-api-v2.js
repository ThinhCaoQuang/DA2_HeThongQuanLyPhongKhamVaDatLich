const http = require('http');
const jwt = require('jsonwebtoken');

// Create a valid token with a real test user
const token = jwt.sign(
  { id: 18, username: 'letan01', role: 'LeTan' },
  process.env.JWT_SECRET || 'clinic-system-secret-key-2026',
  { expiresIn: '7d' }
);

console.log('Testing confirm endpoint with valid token');
console.log('Token:', token);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/lichkham/7/confirm',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const response = JSON.parse(data);
      console.log('Response:', JSON.stringify(response, null, 2));
    } catch {
      console.log('Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(JSON.stringify({}));
req.end();
