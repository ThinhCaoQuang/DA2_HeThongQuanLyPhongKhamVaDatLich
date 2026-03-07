const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// JWT token for BacSi user (ID: 2)
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidGVuRGFuZ05oYXAiOiJkb2N0b3IiLCJ2YWlUcm8iOiJCYWNTaSIsImlhdCI6MTcwODk1NDAwMH0.pCxZyJ0d14f3Q-sLF3N2OPLHzDfD0N7YkFXYZ4X9n_U';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function runTests() {
  console.log('🧪 Testing Medical Records CRUD workflow...\n');

  try {
    // Step 1: Get appointments with confirmed status
    console.log('📋 Step 1: Fetching appointments with DaXacNhan status...');
    const appointmentsRes = await apiClient.get('/lichkham', {
      params: { status: 'DaXacNhan', limit: 5 }
    });
    
    const confirmedAppointments = appointmentsRes.data.data || [];
    
    if (confirmedAppointments.length === 0) {
      console.log('❌ No confirmed appointments found. Creating test data...\n');
      
      // Create a test appointment first
      try {
        const appointmentData = {
          benhNhanId: 1,
          bacSiId: 2,
          chuyenKhoaId: 1,
          thoiGianBatDau: new Date(Date.now() + 86400000).toISOString(), // tomorrow
          trieuChung: 'Test symptoms'
        };
        
        const createRes = await apiClient.post('/lichkham', appointmentData);
        const newAppointment = createRes.data.data;
        
        // Confirm the appointment
        await apiClient.put(`/lichkham/${newAppointment.LichKhamId}/confirm`);
        console.log(`✅ Created and confirmed test appointment: ${newAppointment.MaLichKham}\n`);
        
        confirmedAppointments.push({ ...newAppointment, TrangThai: 'DaXacNhan' });
      } catch (e) {
        console.log(`❌ Failed to create test appointment: ${e.response?.data?.message || e.message}\n`);
        return;
      }
    }

    const testAppointment = confirmedAppointments[0];
    console.log(`✅ Found appointment: ID=${testAppointment.LichKhamId}, Status=${testAppointment.TrangThai}`);
    console.log(`   Patient: ${testAppointment.BenhNhan?.NguoiDung?.HoTen || 'Unknown'}`);
    console.log(`   Doctor: ${testAppointment.BacSi?.NguoiDung?.HoTen || 'Unknown'}\n`);

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
      console.log(`❌ Failed to create medical record: ${e.response?.data?.message || e.message}\n`);
      if (e.response?.data?.message?.includes('đã tồn tại')) {
        console.log('ℹ️  Medical record already exists for this appointment. Fetching it instead...\n');
        
        // List all records and find the one for this appointment
        const listRes = await apiClient.get('/hosokhambenh', { params: { limit: 100 } });
        const records = listRes.data.data || [];
        createdRecord = records.find(r => r.LichKhamId === testAppointment.LichKhamId);
        
        if (!createdRecord) {
          console.log('❌ Could not find existing record\n');
          return;
        }
        
        console.log(`✅ Found existing record: ID=${createdRecord.HoSoId}\n`);
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
      console.log(`   Symptoms: ${fetchedRecord.TrieuChung.substring(0, 50)}...`);
      console.log(`   Treatment: ${fetchedRecord.KeHoachDieuTri.substring(0, 50)}...\n`);
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
      records.slice(0, 3).forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.MaHoSo} - ${r.BenhNhan?.NguoiDung?.HoTen || 'Unknown'}`);
      });
      console.log();
    } catch (e) {
      console.log(`❌ Failed to list records: ${e.response?.data?.message || e.message}\n`);
      return;
    }

    // Step 6: Delete medical record
    console.log('🗑️  Step 6: Deleting medical record...');
    try {
      const deleteRes = await apiClient.delete(`/hosokhambenh/${createdRecord.HoSoId}`);
      console.log(`✅ Record deleted successfully!`);
      console.log(`   Message: ${deleteRes.data.message}\n`);
    } catch (e) {
      console.log(`❌ Failed to delete record: ${e.response?.data?.message || e.message}\n`);
      return;
    }

    // Step 7: Verify deletion
    console.log('🔍 Step 7: Verifying deletion...');
    try {
      await apiClient.get(`/hosokhambenh/${createdRecord.HoSoId}`);
      console.log(`❌ Record still exists after deletion!\n`);
    } catch (e) {
      if (e.response?.status === 404) {
        console.log(`✅ Record confirmed deleted (404 Not Found)\n`);
      } else {
        console.log(`⚠️  Unexpected error: ${e.response?.data?.message || e.message}\n`);
      }
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
