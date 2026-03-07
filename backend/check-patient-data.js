const { BenhNhan, DonThuoc, HoSoKhamBenh, BacSi } = require('./models');

(async () => {
  try {
    console.log('Checking patient data...\n');
    
    // Check if patients have age and gender
    const patients = await BenhNhan.findAll({ limit: 3 });
    console.log('Sample Patients:', JSON.stringify(patients, null, 2));
    
    // Check medical records with full relationship
    const records = await HoSoKhamBenh.findAll({
      include: [
        { model: BenhNhan },
        { model: BacSi, include: [{ association: 'NguoiDung' }] }
      ],
      limit: 2
    });
    
    console.log('\n\nMedical Records:', JSON.stringify(records, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
