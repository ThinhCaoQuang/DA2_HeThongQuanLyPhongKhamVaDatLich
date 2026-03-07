const axios = require('axios');

(async () => {
  try {
    // First login to get token
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'letan',
      password: '123456'
    });
    
    const token = loginRes.data.data.token;
    const api = axios.create({
      baseURL: 'http://localhost:5000/api',
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Fetching medical records with doctor info...\n');
    const res = await api.get('/hosokhambenh?limit=5');
    const records = res.data.data || [];
    
    if (records.length === 0) {
      console.log('No medical records found');
    } else {
      records.forEach(record => {
        console.log('Record:', record.MaHoSo);
        console.log('  Patient:', record.BenhNhan?.HoTen);
        console.log('  Doctor:', record.BacSi?.HoTen || 'N/A');
        console.log();
      });
    }
  } catch (e) {
    console.error('Error:', e.response?.data || e.message);
  }
})();
