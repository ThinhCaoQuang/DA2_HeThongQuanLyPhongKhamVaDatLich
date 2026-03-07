const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL
});

async function setupAndTest() {
  try {
    // Step 1: Register a test user
    console.log('👤 Step 1: Registering test user...');
    try {
      const registerRes = await apiClient.post('/auth/register', {
        hoTen: 'Dr. Test User',
        username: 'testdoctor',
        password: 'test123456',
        email: 'testdoctor@clinic.com',
        vaiTro: 'LeTan'
      });
      console.log(`✅ User registered`);
    } catch (e) {
      const message = e.response?.data?.message || e.message;
      if (message.includes('tồn')) {
        console.log(`ℹ️  User already exists, proceeding...\n`);
      } else {
        console.log(`❌ Registration failed: ${message}, trying login anyway\n`);
      }
    }

    // Step 2: Login
    console.log('🔐 Step 2: Logging in...');
    const loginRes = await apiClient.post('/auth/login', {
      username: 'testdoctor',
      password: 'test123456'
    });
    const TOKEN = loginRes.data.data.token;
    console.log(`✅ Login successful\n`);

    // Setup authenticated client
    const authClient = axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    // Step 3: Get appointments
    console.log('📋 Step 3: Fetching appointments...');
    const appointRes = await authClient.get('/lichkham', { params: { limit: 10 } });
    const appointments = appointRes.data.data || [];
    console.log(`✅ Found ${appointments.length} appointments\n`);

    let testAppointment = appointments.find(a => a.TrangThai === 'DaXacNhan');
    if (!testAppointment && appointments.length > 0) {
      testAppointment = appointments[0];
      console.log(`⚠️  Using appointment with status: ${testAppointment.TrangThai}\n`);
    }

    if (!testAppointment) {
      console.log('❌ No appointments found\n');
      return;
    }

    console.log(`Using appointment: ID=${testAppointment.LichKhamId}\n`);

    // Step 4: Create medical record
    console.log('📝 Step 4: Creating medical record...');
    const createRes = await authClient.post('/hosokhambenh', {
      lichKhamId: testAppointment.LichKhamId,
      trieuChung: 'Headache and fever',
      chanDoan: 'Flu diagnosis',
      keHoachDieuTri: 'Rest and hydration',
      ketLuan: 'Monitor for 3 days',
      ghiChu: 'No additional notes'
    });

    const record = createRes.data.data;
    console.log(`✅ Medical record created: ID=${record.HoSoId}, Code=${record.MaHoSo}\n`);

    // Step 5: Update record
    console.log('✏️  Step 5: Updating medical record...');
    const updateRes = await authClient.put(`/hosokhambenh/${record.HoSoId}`, {
      chanDoan: 'Updated: Severe flu with complications',
      keHoachDieuTri: 'Prescribe antibiotics, rest 5 days'
    });
    console.log(`✅ Record updated\n`);

    // Step 6: List records
    console.log('📊 Step 6: Listing medical records...');
    const listRes = await authClient.get('/hosokhambenh', { params: { limit: 5 } });
    const records = listRes.data.data || [];
    console.log(`✅ Found ${records.length} medical records\n`);

    console.log('✨ All tests completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
  }
}

setupAndTest();
