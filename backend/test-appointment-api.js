/**
 * Test appointment API response
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test token - for testing without auth
async function testAppointmentAPI() {
  try {
    // First login
    console.log('Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      tenDangNhap: 'letantam@clinic.vn',
      matKhau: 'LeTan@123'
    });

    const token = loginRes.data.data.token;
    console.log('Login successful, token:', token.substring(0, 20) + '...\n');

    // Fetch appointments
    console.log('Fetching appointments...');
    const appointmentsRes = await axios.get(`${API_URL}/lichkham`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Total appointments:', appointmentsRes.data.data.length, '\n');

    // Show first appointment detail
    if (appointmentsRes.data.data.length > 0) {
      const apt = appointmentsRes.data.data[0];
      console.log('First appointment detail:');
      console.log('  MaLichKham:', apt.MaLichKham);
      console.log('  BacSiId:', apt.BacSiId);
      console.log('  BacSi object:', apt.BacSi ? 'EXISTS' : 'NULL');
      
      if (apt.BacSi) {
        console.log('    BacSi.BacSiId:', apt.BacSi.BacSiId);
        console.log('    BacSi.NguoiDung:', apt.BacSi.NguoiDung ? 'EXISTS' : 'NULL');
        
        if (apt.BacSi.NguoiDung) {
          console.log('      HoTen:', apt.BacSi.NguoiDung.HoTen);
          console.log('      Email:', apt.BacSi.NguoiDung.Email);
        } else {
          console.log('    ⚠️ NguoiDung is NULL - data issue!');
        }
      } else {
        console.log('  ⚠️ BacSi object is NULL - include missing!');
      }

      console.log('\n  Full appointment object:');
      console.log(JSON.stringify(apt, null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

testAppointmentAPI();
