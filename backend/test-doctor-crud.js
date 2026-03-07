const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to log details
client.interceptors.request.use(config => {
  console.log('Request:', config.method.toUpperCase(), config.url);
  if (config.data) {
    console.log('Body:', JSON.stringify(config.data, null, 2));
  }
  if (config.headers.Authorization) {
    console.log('Token:', config.headers.Authorization.substring(0, 50) + '...');
  }
  return config;
});

async function loginAndGetToken() {
  console.log('\n=== LOGGING IN ===');
  try {
    const res = await axios.post(`${API_URL}/auth/login`, {
      username: 'admin',
      password: 'Admin@123'
    });
    console.log('✅ Login Success');
    console.log('Status:', res.status);
    console.log('Response data:', JSON.stringify(res.data.data, null, 2));
    const token = res.data.data.token;
    const role = res.data.data.role;
    console.log('Role:', role);
    console.log('Token:', token.substring(0, 20) + '...');
    
    // Update client header with new token
    client.defaults.headers['Authorization'] = `Bearer ${token}`;
    
    return token;
  } catch (error) {
    console.error('❌ Login Failed');
    console.error('Status:', error.response?.status);
    console.error('Response:', error.response?.data);
    console.error('Error:', error.message);
    return null;
  }
}

async function testCreateDoctor() {
  console.log('\n=== TEST CREATE DOCTOR ===');
  try {
    const payload = {
      HoTen: 'Nguyễn Văn Test',
      DienThoai: '0987654321',
      Email: 'test.doctor@example.com',
      DiaChi: '123 Test Street',
      SoChungChi: 'CC' + Date.now(),
      ChuyenKhoaId: 1,
      CapHocVan: 'ThacSi',
      NamKinhNghiem: 5
    };
    
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    const res = await client.post('/bacsi', payload);
    console.log('✅ Create Success');
    console.log('Status:', res.status);
    console.log('Doctor ID:', res.data.data.BacSiId);
    console.log('Doctor Name:', res.data.data.NguoiDung.HoTen);
    return res.data.data.BacSiId;
  } catch (error) {
    console.error('❌ Create Failed');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Error:', error.response?.data?.error);
    console.error('Full response:', error.response?.data);
    return null;
  }
}

async function testUpdateDoctor(doctorId) {
  if (!doctorId) {
    console.log('\n❌ Cannot test update - no doctor ID');
    return;
  }
  
  console.log('\n=== TEST UPDATE DOCTOR ===');
  try {
    const payload = {
      HoTen: 'Nguyễn Văn Test Updated',
      DienThoai: '0987654322',
      Email: 'test.updated@example.com',
      DiaChi: '456 Updated Street',
      SoChungChi: 'CC' + (Date.now() + 1000),
      ChuyenKhoaId: 2,
      CapHocVan: 'ThacSi',
      NamKinhNghiem: 6
    };
    
    const res = await client.put(`/bacsi/${doctorId}`, payload);
    console.log('✅ Update Success');
    console.log('Status:', res.status);
    console.log('Updated Doctor Name:', res.data.data.NguoiDung.HoTen);
    return true;
  } catch (error) {
    console.error('❌ Update Failed');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Error:', error.response?.data?.error);
    return false;
  }
}

async function testGetDoctor(doctorId) {
  if (!doctorId) {
    console.log('\n❌ Cannot test get - no doctor ID');
    return;
  }
  
  console.log('\n=== TEST GET DOCTOR ===');
  try {
    const res = await client.get(`/bacsi/${doctorId}`);
    console.log('✅ Get Success');
    console.log('Doctor Name:', res.data.data.NguoiDung.HoTen);
    console.log('License:', res.data.data.SoChungChi);
    return true;
  } catch (error) {
    console.error('❌ Get Failed');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    return false;
  }
}

async function testDeleteDoctor(doctorId) {
  if (!doctorId) {
    console.log('\n❌ Cannot test delete - no doctor ID');
    return;
  }
  
  console.log('\n=== TEST DELETE DOCTOR ===');
  try {
    const res = await client.delete(`/bacsi/${doctorId}`);
    console.log('✅ Delete Success');
    console.log('Status:', res.status);
    console.log('Message:', res.data.message);
    return true;
  } catch (error) {
    console.error('❌ Delete Failed');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Running Doctor CRUD Tests...');
  
  const token = await loginAndGetToken();
  if (!token) {
    console.error('❌ Cannot proceed without valid token');
    return;
  }
  
  const doctorId = await testCreateDoctor();
  await testGetDoctor(doctorId);
  await testUpdateDoctor(doctorId);
  await testDeleteDoctor(doctorId);
  
  console.log('\n✅ All tests completed!');
}

runTests().catch(console.error);
