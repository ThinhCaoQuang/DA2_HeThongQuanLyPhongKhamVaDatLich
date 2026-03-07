const axios = require('axios');

(async () => {
  try {
    console.log('Checking medical records data structure in database...\n');
    
    // Get records directly from database
    const db = require('./models');
    const records = await db.HoSoKhamBenh.findAll({
      limit: 3,
      include: [
        { model: db.LichKham, attributes: ['LichKhamId', 'MaLichKham'] },
        { model: db.BenhNhan, attributes: ['HoTen', 'MaBenhNhan'] },
        { 
          model: db.BacSi, 
          attributes: ['BacSiId', 'NguoiDungId'],
          include: [
            { model: db.NguoiDung, attributes: ['HoTen'] }
          ]
        }
      ]
    });

    if (records.length === 0) {
      console.log('No medical records found in database');
    } else {
      records.forEach((record, idx) => {
        console.log(`Record ${idx + 1}:`);
        console.log('  MaHoSo:', record.MaHoSo);
        console.log('  Patient:', record.BenhNhan?.HoTen);
        console.log('  Doctor:', record.BacSi?.NguoiDung?.HoTen || 'N/A');
        console.log();
      });
    }
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
