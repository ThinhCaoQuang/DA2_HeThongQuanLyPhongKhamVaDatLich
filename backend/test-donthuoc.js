const axios = require('axios');

const api = axios.create({ 
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
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

    // Get prescriptions
    console.log('📋 Fetching prescriptions...');
    try {
      const prescRes = await api.get('/donthuoc?limit=10');
      const prescriptions = prescRes.data.data || [];
      console.log(`✅ Found ${prescriptions.length} prescriptions`);
      if (prescriptions.length > 0) {
        console.log(`First one: ID=${prescriptions[0].DonThuocId}, Code=${prescriptions[0].MaDonThuoc}\n`);
      } else {
        console.log('No prescriptions yet\n');
      }
    } catch (e) {
      console.log(`❌ Failed to fetch prescriptions`);
      console.log(`   Status: ${e.response?.status}`);
      console.log(`   Message: ${e.response?.data?.message || e.message}`);
      console.log(`   Error: ${JSON.stringify(e.response?.data, null, 2)}\n`);
    }

    // Get medical records (for reference)
    console.log('📋 Fetching medical records...');
    try {
      const recordsRes = await api.get('/hosokhambenh?limit=10');
      const records = recordsRes.data.data || [];
      console.log(`✅ Found ${records.length} medical records\n`);
    } catch (e) {
      console.log(`❌ Failed to fetch medical records`);
      console.log(`   Error: ${e.response?.data?.message || e.message}\n`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
})();
