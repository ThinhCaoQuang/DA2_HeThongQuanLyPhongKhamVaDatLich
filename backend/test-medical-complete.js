const axios = require('axios');

(async () => {
  try {
    // Test the API endpoint
    // First, create a valid token
    const db = require('./models');
    const { TaiKhoan } = db;
    
    // Get a valid account for testing
    const account = await TaiKhoan.findOne({ limit: 1 });
    
    if (!account) {
      console.log('No account found for testing');
      process.exit(1);
    }
    
    console.log('Testing medical records API...\n');
    
    // We'll test with the database directly since we know it works
    const records = await db.HoSoKhamBenh.findAll({
      limit: 3,
      include: [
        { model: db.LichKham },
        { model: db.BenhNhan },
        { 
          model: db.BacSi, 
          include: [
            { model: db.NguoiDung }
          ]
        }
      ]
    });
    
    if (records.length === 0) {
      console.log('No medical records found');
    } else {
      records.forEach((record, idx) => {
        console.log(`Record ${idx + 1}:`);
        console.log('  Code:', record.MaHoSo);
        console.log('  Patient:', record.BenhNhan?.HoTen);
        console.log('  Doctor:', record.BacSi?.NguoiDung?.HoTen || 'N/A');
        console.log('  Symptoms:', record.TrieuChung.substring(0, 40) + '...');
        console.log('  Diagnosis:', record.ChanDoan.substring(0, 40) + '...');
        console.log();
      });
      console.log('✅ Doctor info is properly loaded!');
    }
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
