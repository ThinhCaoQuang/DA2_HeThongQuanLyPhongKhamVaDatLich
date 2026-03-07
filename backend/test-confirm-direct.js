require('dotenv').config();
const { sequelize, LichKham, BenhNhan, BacSi, ChuyenKhoa } = require('./models');

async function testConfirm() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connected');

    // Get appointment 6
    const appointment = await LichKham.findByPk(6, {
      include: [
        { model: BenhNhan },
        { model: BacSi },
        { model: ChuyenKhoa }
      ]
    });

    if (!appointment) {
      console.log('Appointment 6 not found');
      return;
    }

    console.log('Appointment 6 current data:');
    console.log(JSON.stringify(appointment.toJSON(), null, 2));

    // Try to update it
    console.log('\nAttempting to confirm...');
    const result = await appointment.update({
      TrangThai: 'DaXacNhan',
      ThoiGianXacNhan: new Date()
    });

    console.log('Success! Updated appointment:');
    console.log(JSON.stringify(result.toJSON(), null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    console.error('SQL Error:', error.sql);
    console.error('Full error:', error);
  } finally {
    await sequelize.close();
  }
}

testConfirm();
