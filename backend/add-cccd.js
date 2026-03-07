const sequelize = require('./config/database');

async function addCCCDColumn() {
  try {
    console.log('🔄 Adding CCCD column to BenhNhan table...');
    
    await sequelize.query(`
      ALTER TABLE BenhNhan 
      ADD COLUMN CCCD VARCHAR(12) 
      AFTER GioiTinh
    `);
    
    console.log('CCCD column added successfully!');
    
    // Verify
    const result = await sequelize.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'BenhNhan' AND COLUMN_NAME = 'CCCD'`);
    if (result[0].length > 0) {
      console.log('Column verified in database');
    }
    
  } catch (error) {
    if (error.message.includes('Duplicate column')) {
      console.log('ℹ️  Column CCCD already exists');
    } else {
      console.error('Error:', error.message);
      process.exit(1);
    }
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

addCCCDColumn();
