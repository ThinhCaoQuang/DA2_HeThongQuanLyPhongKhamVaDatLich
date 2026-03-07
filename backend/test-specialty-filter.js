/**
 * Test script to verify doctor filtering by specialty
 */

const db = require('./models');
const sequelize = db.sequelize;

async function testSpecialtyFilter() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connected\n');

    // Get all specialties
    const specialties = await db.ChuyenKhoa.findAll({ limit: 3 });
    console.log('Specialties found:', specialties.length);
    specialties.forEach(s => {
      console.log(`  - ${s.ChuyenKhoaId}: ${s.TenChuyenKhoa}`);
    });
    console.log();

    // Test filter for first specialty
    if (specialties.length > 0) {
      const testSpecialtyId = specialties[0].ChuyenKhoaId;
      console.log(`Testing filter for specialty ID: ${testSpecialtyId}`);

      const doctors = await db.BacSi.findAll({
        include: [
          { model: db.NguoiDung },
          {
            model: db.BacSiChuyenKhoa,
            where: { ChuyenKhoaId: testSpecialtyId },
            required: true,
            include: [
              { model: db.ChuyenKhoa }
            ]
          }
        ]
      });

      console.log(`\nDoctors for specialty ${specialties[0].TenChuyenKhoa}:`);
      console.log(`Found: ${doctors.length} doctors\n`);

      doctors.forEach(doctor => {
        console.log(`  - ${doctor.BacSiId}: ${doctor.NguoiDung?.HoTen} (${doctor.NguoiDung?.Email})`);
        if (doctor.BacSiChuyenKhoa) {
          doctor.BacSiChuyenKhoa.forEach(bskk => {
            console.log(`      → ${bskk.ChuyenKhoa?.TenChuyenKhoa}`);
          });
        }
      });
    }

    await sequelize.close();
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test error:', error.message);
    process.exit(1);
  }
}

testSpecialtyFilter();
