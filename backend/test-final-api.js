const axios = require('axios');

(async () => {
  try {
    console.log('Testing API with LeTan account...\n');
    
    // Try with LeTan account
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'letan',
      password: '123456'
    });
    
    const token = loginRes.data.data.token;
    const api = axios.create({
      baseURL: 'http://localhost:5000/api',
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Fetching medical records with BacSi info...\n');
    const res = await api.get('/hosokhambenh?limit=2');
    const records = res.data.data || [];
    
    if (records.length === 0) {
      console.log('No records found');
    } else {
      records.forEach((record, idx) => {
        console.log(`\nRecord ${idx + 1}:`);
        console.log('  Code:', record.MaHoSo);
        console.log('  Patient:', record.BenhNhan?.HoTen);
        console.log('  Doctor Name:', record.BacSi?.NguoiDung?.HoTen || 'N/A (missing)');
        console.log('  Full BacSi:', JSON.stringify(record.BacSi, null, 2));
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
