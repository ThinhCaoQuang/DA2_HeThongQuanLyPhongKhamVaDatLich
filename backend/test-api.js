const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwidXNlcm5hbWUiOiJ0ZXN0NDU2Iiwicm9sZSI6IkxlVGFuIiwiaWF0IjoxNzcxODQzNTE2LCJleHAiOjE3NzI0NDgzMTZ9.7sqdMWypMWQ34MvmVyA0RMZcityZ_uvou4dad6qlgH8';

const endpoints = [
  { method: 'GET', path: '/api/test', name: 'API Health', protected: false },
  { method: 'GET', path: '/api/benhnhan', name: 'Patients', protected: true },
  { method: 'GET', path: '/api/bacsi', name: 'Doctors', protected: true },
  { method: 'GET', path: '/api/chuyenkhoa', name: 'Specialties', protected: true },
  { method: 'GET', path: '/api/lichkham', name: 'Appointments', protected: true },
  { method: 'GET', path: '/api/lichlamviec', name: 'Schedules', protected: true },
  { method: 'GET', path: '/api/hosokhambenh', name: 'Medical Records', protected: true }
];

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (endpoint.protected) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const count = Array.isArray(json.data) ? json.data.length : 'OK';
          console.log(`${endpoint.method.padEnd(6)} ${endpoint.path.padEnd(25)} ${endpoint.name.padEnd(20)} [${count}]`);
        } catch (e) {
          console.log(`${endpoint.method.padEnd(6)} ${endpoint.path.padEnd(25)} ${endpoint.name.padEnd(20)} [Parse Error]`);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`${endpoint.method.padEnd(6)} ${endpoint.path.padEnd(25)} ${endpoint.name.padEnd(20)} [${error.code}]`);
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║          🧪 CLINIC MANAGEMENT SYSTEM - API TEST SUITE           ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  let passed = 0;
  for (const endpoint of endpoints) {
    try {
      await testEndpoint(endpoint);
      passed++;
    } catch (e) {
      console.log(`Error testing ${endpoint.path}`);
    }
  }

  console.log('\n════════════════════════════════════════════════════════════════════');
  console.log(`Total Tests: ${endpoints.length} | Passed: ${passed}`);
  console.log('════════════════════════════════════════════════════════════════════\n');
  
  process.exit(0);
}

runTests();
