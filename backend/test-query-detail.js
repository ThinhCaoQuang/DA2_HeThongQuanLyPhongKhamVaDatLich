const db = require('./models');

(async () => {
  try {
    console.log('Testing getAll query...\n');
    
    const records = await db.HoSoKhamBenh.findAll({
      limit: 1,
      include: [
        { model: db.LichKham, attributes: ['LichKhamId', 'MaLichKham', 'ThoiGianBatDau'] },
        { model: db.BenhNhan, attributes: ['BenhNhanId', 'MaBenhNhan', 'HoTen'] },
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
      console.log('No records found');
    } else {
      console.log(JSON.stringify(records[0], null, 2));
    }
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
