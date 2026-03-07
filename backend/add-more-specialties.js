/**
 * Add More Specialties Script
 * Thêm các chuyên khoa cần thiết và nhân sự y tế tương ứng
 * 
 * Usage: node add-more-specialties.js
 */

const db = require('./models');
const bcrypt = require('bcrypt');

async function addMoreSpecialties() {
  try {
    console.log('Bắt đầu thêm chuyên khoa và nhân sự...\n');

    // Dữ liệu chuyên khoa mới
    const newSpecialties = [
      { TenChuyenKhoa: 'Nội khoa', MoTa: 'Chuyên khoa nội khoa - khám chữa bệnh nội tại', TrangThai: 'HoatDong' },
      { TenChuyenKhoa: 'Chỉnh hình', MoTa: 'Chuyên khoa chỉnh hình xương khớp', TrangThai: 'HoatDong' },
      { TenChuyenKhoa: 'Phụ khoa', MoTa: 'Chuyên khoa phụ khoa sản', TrangThai: 'HoatDong' },
      { TenChuyenKhoa: 'Tiêu hoá', MoTa: 'Chuyên khoa tiêu hoá gan mật', TrangThai: 'HoatDong' },
      { TenChuyenKhoa: 'Tâm thần', MoTa: 'Chuyên khoa tâm thần tâm lý', TrangThai: 'HoatDong' },
    ];

    console.log('Thêm chuyên khoa...');
    const createdSpecialties = [];
    for (const specData of newSpecialties) {
      const existing = await db.ChuyenKhoa.findOne({
        where: { TenChuyenKhoa: specData.TenChuyenKhoa }
      });

      if (existing) {
        console.log(`  ⏭️  Chuyên khoa "${specData.TenChuyenKhoa}" đã tồn tại`);
        createdSpecialties.push(existing);
      } else {
        const spec = await db.ChuyenKhoa.create(specData);
        createdSpecialties.push(spec);
        console.log(`  Tạo chuyên khoa: ${specData.TenChuyenKhoa}`);
      }
    }
    console.log('');

    // Dữ liệu bác sĩ cho các chuyên khoa mới
    const doctorsForNewSpecialties = [
      // Nội khoa (3 người)
      {
        tenDangNhap: 'bacsi_noikkhoa_1',
        matKhau: 'Bacsi@123',
        hoTen: 'Nguyễn Hồng Sơn',
        dienThoai: '0921232343',
        email: 'hongson@clinic.vn',
        chuyenKhoa: 'Nội khoa',
        soChungChi: 'BS025',
        capHocVan: 'Tiến sĩ',
        namKinhNghiem: 12,
      },
      {
        tenDangNhap: 'bacsi_noikkhoa_2',
        matKhau: 'Bacsi@123',
        hoTen: 'Trần Thị Hương',
        dienThoai: '0922343454',
        email: 'thuongtran@clinic.vn',
        chuyenKhoa: 'Nội khoa',
        soChungChi: 'BS026',
        capHocVan: 'Thạc sĩ',
        namKinhNghiem: 7,
      },
      {
        tenDangNhap: 'bacsi_noikkhoa_3',
        matKhau: 'Bacsi@123',
        hoTen: 'Đỗ Văn Minh',
        dienThoai: '0923454565',
        email: 'vanminh@clinic.vn',
        chuyenKhoa: 'Nội khoa',
        soChungChi: 'BS027',
        capHocVan: 'Bác sĩ',
        namKinhNghiem: 4,
      },

      // Chỉnh hình (3 người)
      {
        tenDangNhap: 'bacsi_chinhhihn1',
        matKhau: 'Bacsi@123',
        hoTen: 'Lý Công Đạt',
        dienThoai: '0924565676',
        email: 'congdat@clinic.vn',
        chuyenKhoa: 'Chỉnh hình',
        soChungChi: 'BS028',
        capHocVan: 'Thạc sĩ',
        namKinhNghiem: 10,
      },
      {
        tenDangNhap: 'bacsi_chinhhihn2',
        matKhau: 'Bacsi@123',
        hoTen: 'Vương Thị Huyền',
        dienThoai: '0925676787',
        email: 'thuhuyen@clinic.vn',
        chuyenKhoa: 'Chỉnh hình',
        soChungChi: 'BS029',
        capHocVan: 'Bác sĩ',
        namKinhNghiem: 6,
      },
      {
        tenDangNhap: 'bacsi_chinhhihn3',
        matKhau: 'Bacsi@123',
        hoTen: 'Hoàng Văn Tuấn',
        dienThoai: '0926787898',
        email: 'vantuan@clinic.vn',
        chuyenKhoa: 'Chỉnh hình',
        soChungChi: 'BS030',
        capHocVan: 'Bác sĩ',
        namKinhNghiem: 3,
      },

      // Phụ khoa (3 người)
      {
        tenDangNhap: 'bacsi_phukkhoa_1',
        matKhau: 'Bacsi@123',
        hoTen: 'Nguyễn Thị Lan Anh',
        dienThoai: '0927898909',
        email: 'lananh@clinic.vn',
        chuyenKhoa: 'Phụ khoa',
        soChungChi: 'BS031',
        capHocVan: 'Tiến sĩ',
        namKinhNghiem: 15,
      },
      {
        tenDangNhap: 'bacsi_phukkhoa_2',
        matKhau: 'Bacsi@123',
        hoTen: 'Tạ Thị Mộng',
        dienThoai: '0928909010',
        email: 'thimoong@clinic.vn',
        chuyenKhoa: 'Phụ khoa',
        soChungChi: 'BS032',
        capHocVan: 'Thạc sĩ',
        namKinhNghiem: 8,
      },
      {
        tenDangNhap: 'bacsi_phukkhoa_3',
        matKhau: 'Bacsi@123',
        hoTen: 'Bùi Thị Hồng',
        dienThoai: '0929010121',
        email: 'thihong@clinic.vn',
        chuyenKhoa: 'Phụ khoa',
        soChungChi: 'BS033',
        capHocVan: 'Bác sĩ',
        namKinhNghiem: 5,
      },

      // Tiêu hoá (3 người)
      {
        tenDangNhap: 'bacsi_tieuhoa_1',
        matKhau: 'Bacsi@123',
        hoTen: 'Vũ Văn Hùng',
        dienThoai: '0930121232',
        email: 'vanhung@clinic.vn',
        chuyenKhoa: 'Tiêu hoá',
        soChungChi: 'BS034',
        capHocVan: 'Thạc sĩ',
        namKinhNghiem: 9,
      },
      {
        tenDangNhap: 'bacsi_tieuhoa_2',
        matKhau: 'Bacsi@123',
        hoTen: 'Phan Thị Hoa',
        dienThoai: '0931232343',
        email: 'thihoa@clinic.vn',
        chuyenKhoa: 'Tiêu hoá',
        soChungChi: 'BS035',
        capHocVan: 'Bác sĩ',
        namKinhNghiem: 6,
      },
      {
        tenDangNhap: 'bacsi_tieuhoa_3',
        matKhau: 'Bacsi@123',
        hoTen: 'Lê Văn Tú',
        dienThoai: '0932343454',
        email: 'vantu@clinic.vn',
        chuyenKhoa: 'Tiêu hoá',
        soChungChi: 'BS036',
        capHocVan: 'Bác sĩ',
        namKinhNghiem: 4,
      },

      // Tâm thần (3 người)
      {
        tenDangNhap: 'bacsi_tamthan_1',
        matKhau: 'Bacsi@123',
        hoTen: 'Trương Văn Thắng',
        dienThoai: '0933454565',
        email: 'vanthang@clinic.vn',
        chuyenKhoa: 'Tâm thần',
        soChungChi: 'BS037',
        capHocVan: 'Thạc sĩ',
        namKinhNghiem: 8,
      },
      {
        tenDangNhap: 'bacsi_tamthan_2',
        matKhau: 'Bacsi@123',
        hoTen: 'Hoàng Thị Tuyền',
        dienThoai: '0934565676',
        email: 'thituyenn@clinic.vn',
        chuyenKhoa: 'Tâm thần',
        soChungChi: 'BS038',
        capHocVan: 'Bác sĩ',
        namKinhNghiem: 5,
      },
      {
        tenDangNhap: 'bacsi_tamthan_3',
        matKhau: 'Bacsi@123',
        hoTen: 'Ngô Văn Công',
        dienThoai: '0935676787',
        email: 'vancong@clinic.vn',
        chuyenKhoa: 'Tâm thần',
        soChungChi: 'BS039',
        capHocVan: 'Bác sĩ',
        namKinhNghiem: 3,
      },
    ];

    console.log('Tạo bác sĩ cho các chuyên khoa mới...\n');
    let doctorCount = 0;

    for (const docData of doctorsForNewSpecialties) {
      try {
        // Tìm chuyên khoa
        const specialty = createdSpecialties.find(s => s.TenChuyenKhoa === docData.chuyenKhoa);
        if (!specialty) {
          console.log(`  Chuyên khoa "${docData.chuyenKhoa}" không tìm thấy`);
          continue;
        }

        // Kiểm tra bác sĩ đã tồn tại
        const existing = await db.BacSi.findOne({
          where: { SoChungChi: docData.soChungChi }
        });
        if (existing) {
          console.log(`  ⏭️  Bác sĩ ${docData.hoTen} (${docData.soChungChi}) đã tồn tại`);
          continue;
        }

        // Tạo người dùng
        const nguoiDung = await db.NguoiDung.create({
          HoTen: docData.hoTen,
          DienThoai: docData.dienThoai,
          Email: docData.email,
          DiaChi: 'Hà Nội',
          GioiTinh: docData.hoTen.includes('Thị') || docData.hoTen.includes('Tuyền') || docData.hoTen.includes('Hoa') ? 'Nữ' : 'Nam',
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
          TieuSu: `Bác sĩ ${docData.hoTen} có kinh nghiệm ${docData.namKinhNghiem} năm trong lĩnh vực ${docData.chuyenKhoa}`,
          TrangThai: 'HoatDong',
        });

        // Tạo liên kết chuyên khoa
        await db.BacSiChuyenKhoa.create({
          BacSiId: bacSi.BacSiId,
          ChuyenKhoaId: specialty.ChuyenKhoaId,
          LaChuyenMonChinh: true,
        });

        console.log(`  Tạo: ${docData.hoTen} | ${docData.chuyenKhoa} | ${docData.capHocVan} | ${docData.namKinhNghiem} năm`);
        doctorCount++;
      } catch (error) {
        console.log(`  Lỗi tạo bác sĩ ${docData.hoTen}: ${error.message}`);
      }
    }

    console.log(`\nĐã thêm ${doctorCount} bác sĩ mới\n`);

    // Tạo lịch làm việc
    console.log('Tạo lịch làm việc...');
    const allDoctors = await db.BacSi.findAll();
    const today = new Date(2026, 1, 24);

    for (const doctor of allDoctors) {
      const hasSchedule = await db.LichLamViecBacSi.count({
        where: { BacSiId: doctor.BacSiId }
      });

      if (hasSchedule > 0) continue;

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

    console.log('Đã tạo lịch làm việc\n');

    // Thống kê
    const totalSpecialties = await db.ChuyenKhoa.count();
    const totalDoctors = await db.BacSi.count();

    console.log('═══════════════════════════════════════════');
    console.log('✅ HOÀN TẤT THÊM CHUYÊN KHOA VÀ NHÂN SỰ');
    console.log('═══════════════════════════════════════════');
    console.log(`Tổng chuyên khoa: ${totalSpecialties}`);
    console.log(`Tổng bác sĩ: ${totalDoctors}`);
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('Lỗi:', error);
    process.exit(1);
  }
}

addMoreSpecialties();
