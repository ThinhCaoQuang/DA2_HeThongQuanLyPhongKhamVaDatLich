const db = require('./models');

(async () => {
  try {
    console.log('Finding valid admin account...\n');
    
    const accounts = await db.TaiKhoan.findAll({
      where: { VaiTro: 'QuanTri' },
      attributes: ['TenDangNhap', 'VaiTro'],
      limit: 3
    });

    console.log('Admin accounts:');
    accounts.forEach(a => console.log('  ' + a.TenDangNhap));
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
