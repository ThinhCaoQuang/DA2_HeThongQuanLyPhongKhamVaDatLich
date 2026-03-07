/**
 * Add Respiratory Department
 * Thêm chuyên khoa Hô hấp và nhân sự tương ứng
 * 
 * Usage: node add-respiratory.js
 */

const db = require('./models');
const bcrypt = require('bcrypt');

async function addRespiratoryDept() {
  try {
    console.log('Bắt đầu thêm khoa Hô hấp...\n');

    // Tạo chuyên khoa
    console.log('Tạo chuyên khoa Hô hấp...');
    let respiratory = await db.ChuyenKhoa.findOne({
      where: { TenChuyenKhoa: 'Hô hấp' }
    });

    if (!respiratory) {
      respiratory = await db.ChuyenKhoa.create({
        TenChuyenKhoa: 'Hô hấp',
        MoTa: 'Chuyên khoa hô hấp - chẩn đoán và điều trị bệnh lý đường hô hấp',
        TrangThai: 'HoatDong'
      });
      console.log('Tạo chuyên khoa: Hô hấp\n');
    } else {
      console.log('⏭️  Chuyên khoa Hô hấp đã tồn tại\n');
    }

    // Dữ liệu bác sĩ cho khoa Hô hấp
    const doctorsData = [
      {
        tenDangNhap: 'bacsi_hohap_1',
        matKhau: 'Bacsi@123',
        hoTen: 'Trần Hữu Dạt',
        dienThoai: '0936787898',
        email: 'huudat@clinic.vn',
        soChungChi: 'BS040',
        capHocVan: 'Tiến sĩ',
        namKinhNghiem: 14,
      },
      {
        tenDangNhap: 'bacsi_hohap_2',
        matKhau: 'Bacsi@123',
        hoTen: 'Lê Thị Quỳnh',
        dienThoai: '0937898909',
        email: 'thiquynhle@clinic.vn',
        soChungChi: 'BS041',
        capHocVan: 'Thạc sĩ',
        namKinhNghiem: 8,
      },
      {
        tenDangNhap: 'bacsi_hohap_3',
        matKhau: 'Bacsi@123',
        hoTen: 'Nguyễn Văn Thanh',
        dienThoai: '0938909010',
        email: 'vanthanhnguyen@clinic.vn',
        soChungChi: 'BS042',
        capHocVan: 'Bác sĩ',
        namKinhNghiem: 5,
      },
    ];

    console.log('Tạo bác sĩ cho khoa Hô hấp...\n');
    let createdCount = 0;

    for (const docData of doctorsData) {
      try {
        // Kiểm tra bác sĩ đã tồn tại
        const existing = await db.BacSi.findOne({
          where: { SoChungChi: docData.soChungChi }
        });

        if (existing) {
          console.log(`⏭️  Bác sĩ ${docData.hoTen} (${docData.soChungChi}) đã tồn tại`);
          continue;
        }

        // Tạo người dùng
        const nguoiDung = await db.NguoiDung.create({
          HoTen: docData.hoTen,
          DienThoai: docData.dienThoai,
          Email: docData.email,
          DiaChi: 'Hà Nội',
          GioiTinh: docData.hoTen.includes('Thị') ? 'Nữ' : 'Nam',
        });

        // Tạo tài khoản
        const hashedPassword = await bcrypt.hash(docData.matKhau, 10);
        await db.TaiKhoan.create({
          NguoiDungId: nguoiDung.NguoiDungId,
          TenDangNhap: docData.tenDangNhap,
          MatKhauHash: hashedPassword,
          VaiTro: 'BacSi',
          TrangThai: 'HoatDong',
        });

        // Tạo bác sĩ
        const bacSi = await db.BacSi.create({
          NguoiDungId: nguoiDung.NguoiDungId,
          SoChungChi: docData.soChungChi,
          CapHocVan: docData.capHocVan,
          NamKinhNghiem: docData.namKinhNghiem,
          TieuSu: `Bác sĩ ${docData.hoTen} có kinh nghiệm ${docData.namKinhNghiem} năm trong lĩnh vực Hô hấp`,
          TrangThai: 'HoatDong',
        });

        // Tạo liên kết chuyên khoa
        await db.BacSiChuyenKhoa.create({
          BacSiId: bacSi.BacSiId,
          ChuyenKhoaId: respiratory.ChuyenKhoaId,
          LaChuyenMonChinh: true,
        });

        console.log(`Tạo: ${docData.hoTen} | ${docData.capHocVan} | ${docData.namKinhNghiem} năm`);
        createdCount++;
      } catch (error) {
        console.log(`❌ Lỗi tạo bác sĩ ${docData.hoTen}: ${error.message}`);
      }
    }

    console.log(`\n✅ Đã thêm ${createdCount} bác sĩ cho khoa Hô hấp\n`);

    // Tạo lịch làm việc
    console.log('📅 Tạo lịch làm việc...');
    const doctors = await db.BacSi.findAll({
      include: [{
        model: db.ChuyenKhoa,
        where: { TenChuyenKhoa: 'Hô hấp' }
      }]
    });

    const today = new Date(2026, 1, 24);

    for (const doctor of doctors) {
      const hasSchedule = await db.LichLamViecBacSi.count({
        where: { BacSiId: doctor.BacSiId }
      });

      if (hasSchedule === 0) {
        for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
          const workDate = new Date(today);
          workDate.setDate(workDate.getDate() + dayOffset);

          await db.LichLamViecBacSi.create({
            BacSiId: doctor.BacSiId,
            NgayLamViec: workDate,
            CaLam: 'Sang',
            GioBatDau: '08:00',
            GioKetThuc: '12:00',
            TrangThai: 'HoatDong',
          });

          await db.LichLamViecBacSi.create({
            BacSiId: doctor.BacSiId,
            NgayLamViec: workDate,
            CaLam: 'Chieu',
            GioBatDau: '14:00',
            GioKetThuc: '17:00',
            TrangThai: 'HoatDong',
          });
        }
      }
    }

    console.log('✅ Đã tạo lịch làm việc\n');

    console.log('═══════════════════════════════════════════');
    console.log('✅ HOÀN TẤT THÊM KHOA HÔ HẤP');
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

addRespiratoryDept();
