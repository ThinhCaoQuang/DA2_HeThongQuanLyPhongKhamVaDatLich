const axios = require('axios');

const api = axios.create({ 
  baseURL: 'http://localhost:5000/api'
});

let TOKEN = '';

(async () => {
  try {
    // Login first
    console.log('🔐 Logging in...');
    const loginRes = await api.post('/auth/login', {
      username: 'testdoctor',
      password: 'test123456'
    });
    TOKEN = loginRes.data.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${TOKEN}`;
    console.log('✅ Login successful\n');

    // Get appointments
    console.log('📋 Fetching appointments...');
    const aptsRes = await api.get('/lichkham?limit=5');
    const apts = aptsRes.data.data || [];
    
    console.log(`Found ${apts.length} appointments:`);
    apts.forEach(apt => {
      console.log(`  ID: ${apt.LichKhamId}, Status: ${apt.TrangThai}, Code: ${apt.MaLichKham}`);
    });
    
    if (apts.length === 0) {
      console.log('No appointments\n');
      return;
    }
    
    // Delete first appointment
    const toDelete = apts[0];
    console.log(`\n🗑️  Deleting appointment ID ${toDelete.LichKhamId} (${toDelete.MaLichKham}, Status: ${toDelete.TrangThai})...`);
    
    try {
      const deleteRes = await api.delete(`/lichkham/${toDelete.LichKhamId}`);
      console.log('✅ Delete successful!');
      console.log(`   Message: ${deleteRes.data.message}\n`);
    } catch (e) {
      console.log(`❌ Delete failed`);
      console.log(`   Status: ${e.response?.status}`);
      console.log(`   Message: ${e.response?.data?.message || e.message}\n`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
})();
