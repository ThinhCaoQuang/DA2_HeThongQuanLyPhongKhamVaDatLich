const axios = require('axios');

(async () => {
  try {
    // Login first
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: '123456'
    });
    
    const token = loginRes.data.data.token;
    const api = axios.create({
      baseURL: 'http://localhost:5000/api',
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Testing /hosokhambenh API endpoint...\n');
    const res = await api.get('/hosokhambenh?limit=3');
    const records = res.data.data || [];
    
    if (records.length === 0) {
      console.log('No records found');
    } else {
      console.log(JSON.stringify(records[0], null, 2));
    }
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.response?.data || e.message);
    process.exit(1);
  }
})();
