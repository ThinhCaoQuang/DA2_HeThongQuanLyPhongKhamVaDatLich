require('dotenv').config();
const { sequelize, ChuyenKhoa } = require('./models');

async function test() {
  try {
    await sequelize.authenticate();
    console.log('Database connected\n');

    const allSpecialties = await ChuyenKhoa.findAll({
      attributes: ['ChuyenKhoaId', 'TenChuyenKhoa', 'MoTa']
    });

    console.log('All specialties from DB:');
    allSpecialties.forEach(spec => {
      const normalized = spec.TenChuyenKhoa.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      console.log(`  "${spec.TenChuyenKhoa}" (${spec.ChuyenKhoaId}) -> "${normalized}"`);
    });

    // Test matching
    const AIRecommendations = ['Tieu hoa', 'Da lieu', 'Tim mach'];
    console.log('\nTesting AI recommendations matching:\n');

    AIRecommendations.forEach(aiSpec => {
      const aiNorm = aiSpec.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const matched = allSpecialties.find(s => {
        const dbNorm = s.TenChuyenKhoa.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return dbNorm === aiNorm;
      });
      
      console.log(`AI: "${aiSpec}" -> "${aiNorm}" -> ${matched ? `Found: ${matched.TenChuyenKhoa} (${matched.ChuyenKhoaId})` : 'NOT FOUND'}`);
    });

    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

test();
