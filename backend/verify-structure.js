const db = require('./models');

(async () => {
  try {
    console.log('Testing database model with proper include...\n');
    
    const record = await db.HoSoKhamBenh.findOne({
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

    if (!record) {
      console.log('No records found');
    } else {
      console.log('Record data structure:');
      console.log(JSON.stringify({
        MaHoSo: record.MaHoSo,
        BenhNhan: record.BenhNhan,
        BacSi: record.BacSi,
        TrieuChung: record.TrieuChung.substring(0, 30)
      }, null, 2));
      
      console.log('\n✅ Doctor Name:', record.BacSi?.NguoiDung?.HoTen || 'N/A');
    }
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
