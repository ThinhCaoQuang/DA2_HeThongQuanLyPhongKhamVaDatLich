require('dotenv').config();
const { sequelize, LichKham } = require('./models');

async function findPendingAppointments() {
  try {
    await sequelize.authenticate();
    console.log('Finding appointments with ChoXacNhan status...\n');

    const appointments = await LichKham.findAll({
      where: { TrangThai: 'ChoXacNhan' },
      limit: 5
    });

    if (appointments.length === 0) {
      console.log('No appointments with ChoXacNhan status found');
      console.log('\nFinding all appointments...');
      const allAppointments = await LichKham.findAll({ limit: 10 });
      allAppointments.forEach(a => {
        console.log(`ID: ${a.LichKhamId}, Status: ${a.TrangThai}, Time: ${a.ThoiGianBatDau}`);
      });
    } else {
      appointments.forEach(a => {
        console.log(`ID: ${a.LichKhamId}, Status: ${a.TrangThai}, Time: ${a.ThoiGianBatDau}`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

findPendingAppointments();
