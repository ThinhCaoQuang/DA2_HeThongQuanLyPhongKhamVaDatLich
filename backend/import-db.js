const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function importDatabase() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    multipleStatements: true
  };

  // Only add password if it's not empty
  if (process.env.DB_PASSWORD) {
    config.password = process.env.DB_PASSWORD;
  }

  console.log('🔗 Connecting to MySQL:', {
    host: config.host,
    user: config.user,
    hasPassword: !!process.env.DB_PASSWORD
  });

  const connection = await mysql.createConnection(config);

  try {
    const sqlFile = path.join(__dirname, '../QuanLyPhongKham.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('🔄 Importing database schema...');
    await connection.query(sql);
    console.log('✅ Database imported successfully!');
  } catch (error) {
    console.error('❌ Database import error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

importDatabase();
