const axios = require('axios');

(async () => {
  try {
    // Test if server is running
    const healthRes = await axios.get('http://localhost:5000/api/chuyenkhoa', {
      timeout: 5000
    }).catch(e => {
      throw new Error('Server not responding: ' + e.message);
    });
    
    console.log('✅ Server is running!');
    console.log('Status:', healthRes.status);
    
    // Now test the API with admin account
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginRes.data.data.token;
    const api = axios.create({
      baseURL: 'http://localhost:5000/api',
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('\nFetching medical records with BacSi info...\n');
    const res = await api.get('/hosokhambenh?limit=2');
    const records = res.data.data || [];
    
    if (records.length === 0) {
      console.log('No records found');
    } else {
      records.forEach((record, idx) => {
        console.log(`Record ${idx + 1}:`);
        console.log('  Code:', record.MaHoSo);
        console.log('  Patient:', record.BenhNhan?.HoTen);
        console.log('  BacSi structure:', JSON.stringify(record.BacSi, null, 2));
        console.log();
      });
    }
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    if (e.response?.data) {
      console.error('Response:', e.response.data);
    }
    process.exit(1);
  }
})();
