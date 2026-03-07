const { BenhNhan } = require('./models');
const sequelize = require('./config/database');

async function testDB() {
  try {
    console.log('Testing database connection...');
    
    // Check table columns
    const attributes = BenhNhan.rawAttributes;
    console.log('BenhNhan model fields:', Object.keys(attributes));
    
    // Try to fetch data
    console.log('\nFetching patients...');
    const patients = await BenhNhan.findAll({ limit: 5 });
    console.log('Success! Found', patients.length, 'patients');
    console.log('First patient:', patients[0]?.toJSON());
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  } finally {
    process.exit(0);
  }
}

testDB();
