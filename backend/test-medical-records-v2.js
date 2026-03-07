const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

let TOKEN = '';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to request headers
apiClient.interceptors.request.use((config) => {
  if (TOKEN) {
    config.headers.Authorization = `Bearer ${TOKEN}`;
  }
  return config;
});

async function runTests() {
  console.log('🧪 Testing Medical Records CRUD workflow...\n');

  try {
    // Step 0: Login to get valid token
    console.log('🔐 Step 0: Logging in to get valid token...');
    try {
      const loginRes = await apiClient.post('/auth/login', {
        username: 'doctor',
        password: 'password123'
      });
      TOKEN = loginRes.data.token;
      console.log(`✅ Login successful, token obtained\n`);
    } catch (e) {
      console.log(`❌ Login failed: ${e.response?.data?.message || e.message}\n`);
      console.log('Trying with alternate credentials...\n');
      
      const loginRes2 = await apiClient.post('/auth/login', {
        username: 'letran',
        password: 'password123'
      });
      TOKEN = loginRes2.data.token;
      console.log(`✅ Login successful with letran\n`);
    }

    // Step 1: Get appointments with confirmed status
    console.log('📋 Step 1: Fetching appointments with DaXacNhan status...');
    const appointmentsRes = await apiClient.get('/lichkham', {
      params: { status: 'DaXacNhan', limit: 5 }
    });
    
    const confirmedAppointments = appointmentsRes.data.data || [];
    
    if (confirmedAppointments.length === 0) {
      console.log('ℹ️  No confirmed appointments. Trying to fetch any appointments...\n');
      
      const allRes = await apiClient.get('/lichkham', { params: { limit: 10 } });
      const allAppointments = allRes.data.data || [];
      
      if (allAppointments.length === 0) {
        console.log('❌ No appointments found at all\n');
        return;
      }
      
      console.log(`ℹ️  Found ${allAppointments.length} total appointments:`);
      allAppointments.forEach((apt, i) => {
        console.log(`   ${i + 1}. ${apt.MaLichKham || `ID:${apt.LichKhamId}`} - Status: ${apt.TrangThai}`);
      });
      console.log();
    }

    const testAppointment = confirmedAppointments.length > 0 ? confirmedAppointments[0] : (await apiClient.get('/lichkham', { params: { limit: 1 } })).data.data[0];
    
    if (!testAppointment) {
      console.log('❌ No appointment available for testing\n');
      return;
    }

    console.log(`✅ Using appointment: ID=${testAppointment.LichKhamId}, Status=${testAppointment.TrangThai}`);
    console.log(`   Code: ${testAppointment.MaLichKham || 'N/A'}`);
    console.log(`   Patient: ${testAppointment.BenhNhan?.NguoiDung?.HoTen || testAppointment.BenhNhan?.MaBenhNhan || 'Unknown'}\n`);

    // Step 2: Create medical record
    console.log('📝 Step 2: Creating medical record...');
    const createPayload = {
      lichKhamId: testAppointment.LichKhamId,
      trieuChung: 'Test symptoms for medical record',
      chanDoan: 'Test diagnosis: Common cold',
      keHoachDieuTri: 'Rest and drink water for 3 days',
      ketLuan: 'Patient should rest at home',
      ghiChu: 'No hospitalization needed'
    };

    let createdRecord;
    try {
      const createRes = await apiClient.post('/hosokhambenh', createPayload);
      createdRecord = createRes.data.data;
      console.log(`✅ Medical record created successfully!`);
      console.log(`   ID: ${createdRecord.HoSoId}`);
      console.log(`   Code: ${createdRecord.MaHoSo}`);
      console.log(`   Diagnosis: ${createdRecord.ChanDoan}\n`);
    } catch (e) {
      console.log(`❌ Failed to create medical record: ${e.response?.data?.message || e.message}`);
      
      if (e.response?.data?.message?.includes('đã tồn tại')) {
        console.log('ℹ️  Medical record already exists. Fetching existing record...\n');
        
        // List all records and find the one for this appointment
        const listRes = await apiClient.get('/hosokhambenh', { params: { limit: 100 } });
        const records = listRes.data.data || [];
        createdRecord = records.find(r => r.LichKhamId === testAppointment.LichKhamId);
        
        if (!createdRecord) {
          console.log('❌ Could not find existing record\n');
          console.log('Available records:', records.map(r => `ID:${r.HoSoId}`).join(', '));
          
          if (records.length > 0) {
            createdRecord = records[0];
            console.log(`\nUsing first available record: ID=${createdRecord.HoSoId}\n`);
          } else {
            return;
          }
        } else {
          console.log(`✅ Found existing record: ID=${createdRecord.HoSoId}\n`);
        }
      } else {
        return;
      }
    }

    // Step 3: Get medical record by ID
    console.log('🔍 Step 3: Fetching medical record by ID...');
    try {
      const getRes = await apiClient.get(`/hosokhambenh/${createdRecord.HoSoId}`);
      const fetchedRecord = getRes.data.data;
      console.log(`✅ Record fetched successfully`);
      console.log(`   ID: ${fetchedRecord.HoSoId}`);
      console.log(`   Code: ${fetchedRecord.MaHoSo}`);
      console.log(`   Diagnosis: ${fetchedRecord.ChanDoan}\n`);
    } catch (e) {
      console.log(`❌ Failed to fetch record: ${e.response?.data?.message || e.message}\n`);
      return;
    }

    // Step 4: Update medical record
    console.log('✏️  Step 4: Updating medical record...');
    const updatePayload = {
      chanDoan: 'Updated diagnosis: Severe cold with fever',
      keHoachDieuTri: 'Prescribe antibiotics and rest for 5 days',
      ketLuan: 'Patient needs follow-up in 3 days',
      ghiChu: 'Monitor temperature, take medication as prescribed'
    };

    try {
      const updateRes = await apiClient.put(`/hosokhambenh/${createdRecord.HoSoId}`, updatePayload);
      const updatedRecord = updateRes.data.data;
      console.log(`✅ Record updated successfully!`);
      console.log(`   New diagnosis: ${updatedRecord.ChanDoan}\n`);
    } catch (e) {
      console.log(`❌ Failed to update record: ${e.response?.data?.message || e.message}\n`);
      return;
    }

    // Step 5: List all medical records
    console.log('📊 Step 5: Listing all medical records...');
    try {
      const listRes = await apiClient.get('/hosokhambenh', { params: { limit: 10 } });
      const records = listRes.data.data || [];
      console.log(`✅ Found ${records.length} medical records`);
      if (records.length > 0) {
        console.log('   Recent records:');
        records.slice(0, 3).forEach((r, i) => {
          const patientName = r.BenhNhan?.NguoiDung?.HoTen || r.BenhNhan?.MaBenhNhan || 'Unknown';
          console.log(`   ${i + 1}. ${r.MaHoSo} - ${patientName}`);
        });
      }
      console.log();
    } catch (e) {
      console.log(`❌ Failed to list records: ${e.response?.data?.message || e.message}\n`);
      return;
    }

    console.log('✨ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
  }
}

runTests();
