require('dotenv').config();
const { sequelize, LichKham } = require('./models');

async function createTestAppointment() {
  try {
    await sequelize.authenticate();
    console.log('Creating a test appointment...');

    const appointment = await LichKham.create({
      MaLichKham: 'TEST' + Math.random().toString().slice(2, 8),
      BenhNhanId: 19,  // Existing patient
      BacSiId: 41,  // Existing doctor
      ChuyenKhoaId: 16,  // Existing specialty
      ThoiGianBatDau: new Date(Date.now() + 86400000),  // Tomorrow
      ThoiGianKetThuc: new Date(Date.now() + 86400000 + 3600000),  // Tomorrow + 1 hour
      TrieuChung: 'Test symptoms',
      TrangThai: 'ChoXacNhan',  // Pending status
      GhiChu: 'Test appointment',
      TaoBoi: 18
    });

    console.log('✅ Created test appointment:');
    console.log(`  ID: ${appointment.LichKhamId}`);
    console.log(`  Code: ${appointment.MaLichKham}`);
    console.log(`  Status: ${appointment.TrangThai}`);
    console.log(`  Time: ${appointment.ThoiGianBatDau}`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

createTestAppointment();
