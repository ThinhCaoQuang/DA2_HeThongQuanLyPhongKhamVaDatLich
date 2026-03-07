require('dotenv').config();
const { NguoiDung, TaiKhoan, BacSi } = require('./models');

async function fixBacSiAccount() {
  try {
    console.log('🔍 Tìm kiếm tài khoản "Nguyễn Văn A"...');
    
    // Find the NguoiDung with name "Nguyễn Văn A"
    const nguoiDung = await NguoiDung.findOne({
      where: { HoTen: 'Nguyễn Văn A' }
    });

    if (!nguoiDung) {
      console.log('Không tìm thấy "Nguyễn Văn A"');
      return;
    }

    console.log(`Tìm thấy: ${nguoiDung.HoTen} (ID: ${nguoiDung.NguoiDungId})`);

    // Check if this person is a BacSi
    const existingBacSi = await BacSi.findOne({
      where: { NguoiDungId: nguoiDung.NguoiDungId }
    });

    if (existingBacSi) {
      console.log('⚠️  Người này đã là bác sĩ');
      return;
    }

    // Create BacSi record
    console.log('📝 Tạo record BacSi...');
    const bacSi = await BacSi.create({
      NguoiDungId: nguoiDung.NguoiDungId,
      SoChungChi: 'BS000001', // Default certificate number
      CapHocVan: 'Tiến sĩ',
      NamKinhNghiem: 5,
      TrangThai: 'HoatDong'
    });

    console.log('Tạo BacSi thành công!');
    console.log('BacSi Info:', {
      BacSiId: bacSi.BacSiId,
      NguoiDungId: bacSi.NguoiDungId,
      HoTen: nguoiDung.HoTen,
      SoChungChi: bacSi.SoChungChi,
      CapHocVan: bacSi.CapHocVan,
      NamKinhNghiem: bacSi.NamKinhNghiem
    });

    console.log('\n✨ Tài khoản "Nguyễn Văn A" giờ đã xuất hiện trong danh sách bác sĩ!');
  } catch (error) {
    console.error('Lỗi:', error.message);
  } finally {
    process.exit(0);
  }
}

fixBacSiAccount();
