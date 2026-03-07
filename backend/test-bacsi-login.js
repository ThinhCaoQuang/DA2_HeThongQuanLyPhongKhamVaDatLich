const axios = require('axios');

(async () => {
  try {
    console.log('Testing API with BacSi account...\n');
    
    // Try with BacSi account
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'bacsi_hung',
      password: '123456'
    });
    
    const token = loginRes.data.data.token;
    const api = axios.create({
      baseURL: 'http://localhost:5000/api',
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Fetching medical records...\n');
    const res = await api.get('/hosokhambenh?limit=2');
    const records = res.data.data || [];
    
    if (records.length === 0) {
      console.log('No records found');
    } else {
      records.forEach((record, idx) => {
        console.log(`Record ${idx + 1}:`);
        console.log('  MaHoSo:', record.MaHoSo);
        console.log('  Patient:', record.BenhNhan?.HoTen);
        console.log('  Doctor Name:', record.BacSi?.NguoiDung?.HoTen || 'N/A (missing)');
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
