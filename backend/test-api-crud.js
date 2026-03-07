    const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwidXNlcm5hbWUiOiJ0ZXN0NDU2Iiwicm9sZSI6IkxlVGFuIiwiaWF0IjoxNzcxODQzNTE2LCJleHAiOjE3NzI0NDgzMTZ9.7sqdMWypMWQ34MvmVyA0RMZcityZ_uvou4dad6qlgH8';

function makeRequest(method, path, body = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, error: e.message });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ status: 0, error: error.message });
    });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║    🧪 CLINIC API - CREATE/UPDATE/DELETE OPERATIONS TEST         ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  let passed = 0;
  let failed = 0;

  // Test 1: CREATE Patient
  console.log('📝 Testing CREATE Patient...');
  const patientData = {
    hoTen: 'Test Patient ' + Date.now(),
    gioiTinh: 'Nam',
    ngaySinh: '1990-05-15',
    dienThoai: '0901234567',
    email: 'test@example.com',
    diaChi: 'Test Address'
  };
  let res = await makeRequest('POST', '/api/benhnhan', patientData);
  if (res.status === 201 && res.data.success) {
    console.log(`   Created patient: ${res.data.data.MaBenhNhan}`);
    passed++;
  } else {
    console.log(`   ❌ Failed (${res.status})`);
    failed++;
  }

  // Test 2: CREATE Doctor
  console.log('\n📝 Testing CREATE Doctor...');
  const doctorData = {
    hoTen: 'BS Test ' + Date.now(),
    gioiTinh: 'Nam',
    dienThoai: '0987654321',
    soChungChi: 'SC' + Date.now(),
    capHocVan: 'Thạc sĩ',
    namKinhNghiem: 5
  };
  res = await makeRequest('POST', '/api/bacsi', doctorData);
  if (res.status === 201 && res.data.success) {
    console.log(`   Created doctor: ${res.data.data.MaBacSi}`);
    passed++;
  } else {
    console.log(`   ❌ Failed (${res.status}): ${res.data?.message}`);
    failed++;
  }

  // Test 3: CREATE Schedule
  console.log('\n📝 Testing CREATE Schedule...');
  const scheduleData = {
    bacSiId: 1,
    ngayLamViec: '2026-03-15',
    caLam: 'Sáng',
    gioBatDau: '08:00',
    gioKetThuc: '11:30',
    soBenhNhanToiDa: 10
  };
  res = await makeRequest('POST', '/api/lichlamviec', scheduleData);
  if (res.status === 201 && res.data.success) {
    console.log(`   Created schedule: ${res.data.data.MaLichLamViec}`);
    passed++;
  } else {
    console.log(`   ❌ Failed (${res.status}): ${res.data?.message}`);
    failed++;
  }

  // Test 4: CREATE Appointment
  console.log('\n📝 Testing CREATE Appointment...');
  const appointmentData = {
    benhNhanId: 1,
    bacSiId: 1,
    chuyenKhoaId: 1,
    thoiGianBatDau: '2026-03-15T09:00:00',
    trieuChung: 'Đau đầu'
  };
  res = await makeRequest('POST', '/api/lichkham', appointmentData);
  if (res.status === 201 && res.data.success) {
    console.log(`   Created appointment: ${res.data.data.MaLichKham}`);
    passed++;
  } else {
    console.log(`   ❌ Failed (${res.status}): ${res.data?.message}`);
    failed++;
  }

  // Test 5: UPDATE Patient
  console.log('\n✏️  Testing UPDATE Patient...');
  const updateData = { hoTen: 'Updated Patient Name', dienThoai: '0999999999' };
  res = await makeRequest('PUT', '/api/benhnhan/1', updateData);
  if ((res.status === 200 || res.status === 204) && res.data.success) {
    console.log(`   Patient updated`);
    passed++;
  } else {
    console.log(`   ❌ Failed (${res.status})`);
    failed++;
  }

  // Test 6: Test error handling - Missing required field
  console.log('\n⚠️  Testing Error Handling (Missing email)...');
  const invalidData = { hoTen: 'No Email Patient' };
  res = await makeRequest('POST', '/api/benhnhan', invalidData);
  if (res.status !== 201) {
    console.log(`   ✅ Correctly rejected invalid input (${res.status})`);
    passed++;
  } else {
    console.log(`   ❌ Should have rejected invalid input`);
    failed++;
  }

  // Test 7: Test Authentication - No token
  console.log('\nTesting Authentication (No Token)...');
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/benhnhan',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  };
  res = await new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
    });
    req.on('error', (e) => resolve({ status: 0 }));
    req.end();
  });
  if (res.status === 401) {
    console.log(`   ✅ Correctly rejected unauthenticated request`);
    passed++;
  } else {
    console.log(`   ❌ Should have rejected unauthenticated request`);
    failed++;
  }

  console.log('\n════════════════════════════════════════════════════════════════════');
  console.log(`📊 Test Results: ${passed + failed} Total | ✅ ${passed} Passed | ❌ ${failed} Failed`);
  console.log('════════════════════════════════════════════════════════════════════\n');
  
  process.exit(failed === 0 ? 0 : 1);
}

runTests();
