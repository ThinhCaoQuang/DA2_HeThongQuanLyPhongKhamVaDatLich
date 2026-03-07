const http = require('http');

// Test token for LeTan (id=2, role=LeTan)
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJsZXRhbjAxIiwicm9sZSI6IkxlVGFuIiwiaWF0IjoxNzA4OTMwODkzLCJleHAiOjE3MDk1MzU2OTN9.g8K3P8gQ_rg1HLnY_-kMzK3pT5gH3vI8f2qL7pK1xYE';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/lichkham/6/confirm',
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
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(JSON.stringify({}));
req.end();
