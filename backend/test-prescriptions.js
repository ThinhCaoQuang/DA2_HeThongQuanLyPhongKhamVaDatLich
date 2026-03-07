const db = require('./models');

(async () => {
  try {
    console.log('Testing Prescriptions (DonThuoc) functionality...\n');
    
    // Check if medical records exist
    const records = await db.HoSoKhamBenh.findAll({ limit: 3 });
    console.log(`✓ Found ${records.length} medical records`);
    
    // Check prescriptions
    const prescriptions = await db.DonThuoc.findAll({
      include: [
        { model: db.HoSoKhamBenh },
        { model: db.DonThuocChiTiet }
      ],
      limit: 3
    });
    
    console.log(`✓ Found ${prescriptions.length} prescriptions`);
    
    if (prescriptions.length > 0) {
      const p = prescriptions[0];
      console.log(`\nFirst prescription details:`);
      console.log(`  Code: ${p.MaDonThuoc}`);
      console.log(`  Record: ${p.HoSoKhamBenh?.MaHoSo}`);
      console.log(`  Medicines: ${p.DonThuocChiTiets?.length || 0}`);
      
      if (p.DonThuocChiTiets && p.DonThuocChiTiets.length > 0) {
        console.log(`  First medicine: ${p.DonThuocChiTiets[0].TenThuoc} - ${p.DonThuocChiTiets[0].LieuLuong}`);
      }
    } else {
      console.log('\nNo prescriptions found - API is ready for testing');
    }
    
    console.log('\n✅ Prescriptions feature is ready!');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
