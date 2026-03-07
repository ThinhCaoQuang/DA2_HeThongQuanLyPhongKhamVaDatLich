const axios = require('axios');

const api = axios.create({ 
  baseURL: 'http://localhost:5000/api'
});

let TOKEN = '';

(async () => {
  try {
    // Login
    console.log('🔐 Logging in...');
    const loginRes = await api.post('/auth/login', {
      username: 'testdoctor',
      password: 'test123456'
    });
    TOKEN = loginRes.data.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${TOKEN}`;
    console.log('✅ Login successful\n');

    // Get appointments
    console.log('🔍 Fetching appointments...');
    const aptsRes = await api.get('/lichkham?limit=10');
    const apts = aptsRes.data.data || [];
    
    // Find one with ChoXacNhan status to test confirm
    let toConfirm = apts.find(apt => apt.TrangThai === 'ChoXacNhan');
    
    if (!toConfirm) {
      console.log('⚠️ No ChoXacNhan appointment found. Creating test one...\n');
      // Create one if needed
      return;
    }
    
    console.log(`Found ChoXacNhan appointment: ID=${toConfirm.LichKhamId}, Status=${toConfirm.TrangThai}\n`);

    // Try to confirm it
    console.log(`🔄 Confirming appointment ID ${toConfirm.LichKhamId}...`);
    try {
      const confirmRes = await api.post(`/lichkham/${toConfirm.LichKhamId}/confirm`, {});
      console.log('✅ Confirm successful!');
      console.log(`   Message: ${confirmRes.data.message}\n`);
    } catch (e) {
      console.log(`❌ Confirm failed`);
      console.log(`   Status: ${e.response?.status}`);
      console.log(`   Message: ${e.response?.data?.message || e.message}`);
      console.log(`   Full error: ${JSON.stringify(e.response?.data, null, 2)}\n`);
    }

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
  }
})();
