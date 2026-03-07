/**
 * Test Data Seeding Script
 * Thêm dữ liệu test vào database
 * 
 * Usage: node seed-data.js
 */

const db = require('./models');
const bcrypt = require('bcrypt');

async function seedData() {
  try {
    console.log('🌱 Bắt đầu thêm dữ liệu test...\n');

    // Xoá dữ liệu cũ (optional)
    console.log('🗑️  Xoá dữ liệu cũ...');
    // Tắt foreign key checks trước khi xoá
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    await db.HoSoKhamBenh.destroy({ where: {}, truncate: false });
    await db.LichKham.destroy({ where: {}, truncate: false });
    await db.LichLamViecBacSi.destroy({ where: {}, truncate: false });
    await db.BacSiChuyenKhoa.destroy({ where: {}, truncate: false });
    await db.BacSi.destroy({ where: {}, truncate: false });
    await db.BenhNhan.destroy({ where: {}, truncate: false });
    await db.TaiKhoan.destroy({ where: {}, truncate: false });
    await db.NguoiDung.destroy({ where: {}, truncate: false });
    await db.ChuyenKhoa.destroy({ where: {}, truncate: false });
    
    // Bật lại foreign key checks
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Đã xoá dữ liệu cũ\n');

    // 1. TẠO CHUYÊN KHOA
    console.log('📋 Tạo chuyên khoa...');
    const specialties = await db.ChuyenKhoa.bulkCreate([
      { TenChuyenKhoa: 'Tim mạch', MoTa: 'Chuyên khoa tim mạch', TrangThai: 'HoatDong' },
      { TenChuyenKhoa: 'Da liễu', MoTa: 'Chuyên khoa da liễu', TrangThai: 'HoatDong' },
      { TenChuyenKhoa: 'Nhi khoa', MoTa: 'Chuyên khoa nhi khoa', TrangThai: 'HoatDong' },
      { TenChuyenKhoa: 'Nha khoa', MoTa: 'Chuyên khoa nha khoa', TrangThai: 'HoatDong' },
      { TenChuyenKhoa: 'Tai Mũi Họng', MoTa: 'Chuyên khoa tai mũi họng', TrangThai: 'HoatDong' },
    ]);
    console.log(`✅ Tạo ${specialties.length} chuyên khoa\n`);

    // 2. TẠO TÀI KHOẢN & NGƯỜI DÙNG CHO BÁC SĨ
    console.log('👨‍⚕️ Tạo bác sĩ...');
    
    const doctorsData = [
      {
        tenDangNhap: 'bacsi_hung',
        matKhau: 'Bacsi@123',
        hoTen: 'Trần Văn Hùng',
        dienThoai: '0901234567',
        email: 'hung@clinic.vn',
        diaChi: 'Hà Nội',
        chuyenKhoa: 'Tim mạch',
        soChungChi: 'BS001',
      },
      {
        tenDangNhap: 'bacsi_linh',
        matKhau: 'Bacsi@123',
        hoTen: 'Lê Thị Linh',
        dienThoai: '0902345678',
        email: 'linh@clinic.vn',
        diaChi: 'Hà Nội',
        chuyenKhoa: 'Da liễu',
        soChungChi: 'BS002',
      },
      {
        tenDangNhap: 'bacsi_tuan',
        matKhau: 'Bacsi@123',
        hoTen: 'Nguyễn Minh Tuấn',
        dienThoai: '0903456789',
        email: 'tuan@clinic.vn',
        diaChi: 'Hà Nội',
        chuyenKhoa: 'Nhi khoa',
        soChungChi: 'BS003',
      },
      {
        tenDangNhap: 'bacsi_huong',
        matKhau: 'Bacsi@123',
        hoTen: 'Đặng Hương',
        dienThoai: '0904567890',
        email: 'huong@clinic.vn',
        diaChi: 'Hà Nội',
        chuyenKhoa: 'Nha khoa',
        soChungChi: 'BS004',
      },
      {
        tenDangNhap: 'bacsi_minh',
        matKhau: 'Bacsi@123',
        hoTen: 'Phạm Quốc Minh',
        dienThoai: '0905678901',
        email: 'minh@clinic.vn',
        diaChi: 'Hà Nội',
        chuyenKhoa: 'Tai Mũi Họng',
        soChungChi: 'BS005',
      },
    ];

    const doctors = [];
    for (const docData of doctorsData) {
      const specialty = specialties.find(s => s.TenChuyenKhoa === docData.chuyenKhoa);
      
      const nguoiDung = await db.NguoiDung.create({
        HoTen: docData.hoTen,
        DienThoai: docData.dienThoai,
        Email: docData.email,
        DiaChi: docData.diaChi,
        GioiTinh: 'Nam',
      });

      const hashedPassword = await bcrypt.hash(docData.matKhau, 10);
      const taiKhoan = await db.TaiKhoan.create({
        NguoiDungId: nguoiDung.NguoiDungId,
        TenDangNhap: docData.tenDangNhap,
        MatKhauHash: hashedPassword,
        VaiTro: 'BacSi',
        TrangThai: 'HoatDong',
      });

      const bacSi = await db.BacSi.create({
        NguoiDungId: nguoiDung.NguoiDungId,
        SoChungChi: docData.soChungChi,
        CapHocVan: 'Tiến sĩ',
        NamKinhNghiem: 10,
        TieuSu: `Bác sĩ ${docData.hoTen} có kinh nghiệm khám chữa bệnh trên 10 năm`,
        TrangThai: 'HoatDong',
      });

      await db.BacSiChuyenKhoa.create({
        BacSiId: bacSi.BacSiId,
        ChuyenKhoaId: specialty.ChuyenKhoaId,
        LaChuyenMonChinh: true,
      });

      doctors.push(bacSi);
      console.log(`  ✅ Tạo bác sĩ: ${docData.hoTen} (${docData.chuyenKhoa})`);
    }
    console.log('');

    // 3. TẠO LỊCH LÀM VIỆC CHO BÁC SĨ (QUAN TRỌNG CHO FORM APPOINTMENTS)
    console.log('📅 Tạo lịch làm việc cho bác sĩ...');
    
    // Lấy ngày hôm nay và các ngày tiếp theo
    const today = new Date(2026, 1, 24); // 24/02/2026
    
    for (let i = 0; i < doctors.length; i++) {
      // Mỗi bác sĩ làm việc 5 ngày (từ hôm nay đến ngày 28/02)
      for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
        const workDate = new Date(today);
        workDate.setDate(workDate.getDate() + dayOffset);
        
        if (workDate.getDay() !== 0 && workDate.getDay() !== 6) { // Bỏ qua thứ 7 & CN
          // Sáng (8:00 - 12:00)
          await db.LichLamViecBacSi.create({
            BacSiId: doctors[i].BacSiId,
            NgayLamViec: workDate.toISOString().split('T')[0],
            CaLam: 'Sang',
            GioBatDau: '08:00:00',
            GioKetThuc: '12:00:00',
            SlotMinutes: 30,
            SoBenhNhanToiDa: 8,
            TrangThai: 'HoatDong',
          });
          
          // Chiều (14:00 - 17:00)
          await db.LichLamViecBacSi.create({
            BacSiId: doctors[i].BacSiId,
            NgayLamViec: workDate.toISOString().split('T')[0],
            CaLam: 'Chieu',
            GioBatDau: '14:00:00',
            GioKetThuc: '17:00:00',
            SlotMinutes: 30,
            SoBenhNhanToiDa: 6,
            TrangThai: 'HoatDong',
          });
        }
      }
      console.log(`  ✅ Tạo lịch làm việc cho bác sĩ ID ${doctors[i].BacSiId}`);
    }
    console.log('');

    // 4. TẠO BỆNH NHÂN
    console.log('🏥 Tạo bệnh nhân...');
    
    const patientsData = [
      { hoTen: 'Nguyễn Văn An', dienThoai: '0911111111', email: 'an@gmail.com', diaChi: 'Hà Nội', ngaySinh: '1980-05-15', cccd: '001234567890', gioiTinh: 'Nam' },
      { hoTen: 'Trần Thị Bình', dienThoai: '0912222222', email: 'binh@gmail.com', diaChi: 'Hà Nội', ngaySinh: '1990-08-20', cccd: '001234567891', gioiTinh: 'Nu' },
      { hoTen: 'Phạm Văn Cương', dienThoai: '0913333333', email: 'cuong@gmail.com', diaChi: 'Hà Nội', ngaySinh: '1985-03-10', cccd: '001234567892', gioiTinh: 'Nam' },
      { hoTen: 'Lê Thị Duyên', dienThoai: '0914444444', email: 'duyen@gmail.com', diaChi: 'Hà Nội', ngaySinh: '1995-11-25', cccd: '001234567893', gioiTinh: 'Nu' },
      { hoTen: 'Hoàng Văn Em', dienThoai: '0915555555', email: 'em@gmail.com', diaChi: 'Hà Nội', ngaySinh: '1988-07-12', cccd: '001234567894', gioiTinh: 'Nam' },
    ];

    const patients = [];
    for (let i = 0; i < patientsData.length; i++) {
      const patData = patientsData[i];

      const benhNhan = await db.BenhNhan.create({
        MaBenhNhan: `BN${String(i + 1).padStart(5, '0')}`,
        HoTen: patData.hoTen,
        DienThoai: patData.dienThoai,
        Email: patData.email,
        DiaChi: patData.diaChi,
        NgaySinh: patData.ngaySinh,
        GioiTinh: patData.gioiTinh,
        CCCD: patData.cccd,
        TrangThai: 'HoatDong',
      });

      patients.push(benhNhan);
      console.log(`  ✅ Tạo bệnh nhân: ${patData.hoTen}`);
    }
    console.log('');

    // 5. TẠO LỊCH KHÁM (OPTIONAL - dữ liệu ví dụ)
    console.log('📝 Tạo lịch khám mẫu...');
    
    const appointmentDate1 = new Date(2026, 1, 25, 9, 0);
    const appointmentDate2 = new Date(2026, 1, 25, 10, 0);
    
    const firstAppointment = await db.LichKham.create({
      MaLichKham: 'LK000001',
      BenhNhanId: patients[0].BenhNhanId,
      BacSiId: doctors[0].BacSiId,
      ChuyenKhoaId: specialties[0].ChuyenKhoaId,
      ThoiGianBatDau: appointmentDate1,
      TrieuChung: 'Đau ngực, khó thở',
      TrangThai: 'ChoXacNhan',
      GhiChu: 'Bệnh nhân mới',
    });
    
    const secondAppointment = await db.LichKham.create({
      MaLichKham: 'LK000002',
      BenhNhanId: patients[1].BenhNhanId,
      BacSiId: doctors[1].BacSiId,
      ChuyenKhoaId: specialties[1].ChuyenKhoaId,
      ThoiGianBatDau: appointmentDate2,
      TrieuChung: 'Mụn, viêm da',
      TrangThai: 'DaXacNhan',
      GhiChu: 'Bệnh nhân theo dõi',
    });

    console.log(`  ✅ Tạo lịch khám: ${firstAppointment.MaLichKham}`);
    console.log(`  ✅ Tạo lịch khám: ${secondAppointment.MaLichKham}`);
    console.log('');

    // 6. TẠO TÀI KHOẢN LỄ TÂN
    console.log('👩‍💼 Tạo tài khoản lễ tân...');
    
    const receptionistData = {
      hoTen: 'Nguyễn Thị Hoa',
      dienThoai: '0920987654',
      email: 'hoa@clinic.vn',
      diaChi: 'Hà Nội',
      tenDangNhap: 'letam_hoa',
      matKhau: 'LeTan@123',
    };

    const receptionistNguoiDung = await db.NguoiDung.create({
      HoTen: receptionistData.hoTen,
      DienThoai: receptionistData.dienThoai,
      Email: receptionistData.email,
      DiaChi: receptionistData.diaChi,
      GioiTinh: 'Nu',
    });

    const receptionistHashedPassword = await bcrypt.hash(receptionistData.matKhau, 10);
    await db.TaiKhoan.create({
      NguoiDungId: receptionistNguoiDung.NguoiDungId,
      TenDangNhap: receptionistData.tenDangNhap,
      MatKhauHash: receptionistHashedPassword,
      VaiTro: 'LeTan',
      TrangThai: 'HoatDong',
    });

    console.log(`  ✅ Tạo tài khoản lễ tân: ${receptionistData.hoTen}`);
    console.log('');

    // 7. TẠO TÀI KHOẢN ADMIN
    console.log('👨‍💼 Tạo tài khoản admin...');
    
    const adminData = {
      hoTen: 'Trần Quốc Anh',
      dienThoai: '0921111111',
      email: 'admin@clinic.vn',
      diaChi: 'Hà Nội',
      tenDangNhap: 'admin',
      matKhau: 'Admin@123',
    };

    const adminNguoiDung = await db.NguoiDung.create({
      HoTen: adminData.hoTen,
      DienThoai: adminData.dienThoai,
      Email: adminData.email,
      DiaChi: adminData.diaChi,
      GioiTinh: 'Nam',
    });

    const adminHashedPassword = await bcrypt.hash(adminData.matKhau, 10);
    await db.TaiKhoan.create({
      NguoiDungId: adminNguoiDung.NguoiDungId,
      TenDangNhap: adminData.tenDangNhap,
      MatKhauHash: adminHashedPassword,
      VaiTro: 'QuanTri',
      TrangThai: 'HoatDong',
    });

    console.log(`  ✅ Tạo tài khoản admin: ${adminData.hoTen}`);
    console.log('');

    // TÓMSOMMARY
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ HOÀN THÀNH THÊM DỮ LIỆU TEST!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📊 Tóm tắt dữ liệu được tạo:');
    console.log(`  • Chuyên khoa: ${specialties.length}`);
    console.log(`  • Bác sĩ: ${doctors.length}`);
    console.log(`  • Lịch làm việc: ${doctors.length * 10} (mỗi bác sĩ ~10 ca)`);
    console.log(`  • Bệnh nhân: ${patients.length}`);
    console.log(`  • Lịch khám: 2`);
    console.log(`  • Tài khoản lễ tân: 1`);
    console.log(`  • Tài khoản admin: 1`);
    console.log('\n🔑 Tài khoản đăng nhập:');
    console.log(`\n  👨‍⚕️ Bác sĩ (VD):`);
    console.log(`     Tên đăng nhập: bacsi_hung`);
    console.log(`     Mật khẩu: Bacsi@123`);
    console.log(`\n  👩‍💼 Lễ tân:`);
    console.log(`     Tên đăng nhập: letam_hoa`);
    console.log(`     Mật khẩu: LeTan@123`);
    console.log(`\n  👨‍💼 Admin:`);
    console.log(`     Tên đăng nhập: admin`);
    console.log(`     Mật khẩu: Admin@123`);
    console.log('');

  } catch (error) {
    console.error('❌ Lỗi khi thêm dữ liệu:', error);
    process.exit(1);
  } finally {
    await db.sequelize.close();
    process.exit(0);
  }
}

seedData();
