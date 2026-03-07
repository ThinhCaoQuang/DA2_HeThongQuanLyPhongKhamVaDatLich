const sequelize = require('./config/database');
const { BenhNhan } = require('./models');

async function migrate() {
  try {
    console.log('🔄 Starting migration...');
    
    // Sync model with database (will alter table to add missing columns)
    await sequelize.sync({ alter: true });
    
    console.log('✅ Migration completed successfully!');
    console.log('✨ CCCD column has been added to BenhNhan table');
    
    // Verify
    const patients = await BenhNhan.findAll({ limit: 1 });
    console.log('✅ Database query successful!');
    if (patients.length > 0) {
      console.log('First patient sample:', patients[0].toJSON());
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

migrate();
