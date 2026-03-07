const axios = require('axios');

const api = axios.create({ 
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

(async () => {
  try {
    console.log('Checking appointment statuses...\n');
    const res = await api.get('/lichkham?limit=10');
    const apts = res.data.data || [];
    apts.forEach(apt => {
      console.log(`ID: ${apt.LichKhamId}, Status: ${apt.TrangThai}, Code: ${apt.MaLichKham || 'N/A'}`);
    });
  } catch (e) {
    console.log('Error:', e.response?.data?.message || e.message);
  }
})();
