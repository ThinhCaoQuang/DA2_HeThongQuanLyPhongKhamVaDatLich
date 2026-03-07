/**
 * Add More Doctors Script
 * Thêm nhân viên y tế (bác sĩ) cho mỗi khoa: 2-3 người với trình độ & kinh nghiệm khác nhau
 * 
 * Usage: node add-more-doctors.js
 */

const db = require('./models');
const bcrypt = require('bcrypt');

async function addMoreDoctors() {
  try {
    console.log('Bắt đầu thêm nhân sự y tế...\n');

    // Lấy danh sách chuyên khoa
    const specialties = await db.ChuyenKhoa.findAll();
    console.log(`Tìm thấy ${specialties.length} chuyên khoa\n`);

    // Dữ liệu bác sĩ mới - groupby chuyên khoa
    const newDoctorsData = [
      // Tim mạch (3 người)
      {
        tenDangNhap: 'bacsi_hung_2',
        matKhau: 'Bacsi@123',
        hoTen: 'Lê Quốc Hùng',
        dienThoai: '0911222333',
        email: 'hungq@clinic.vn',
        diaChi: 'Hà Nội',
        chuyenKhoa: 'Tim mạch',
        soChungChi: 'BS006',
        capHocVan: 'Thạc sĩ',
        namKinhNghiem: 8,
      },
      {
        tenDangNhap: 'bacsi_hung_3',
        matKhau: 'Bacsi@123',
        hoTen: 'Vũ Thị Mỹ Linh',
        dienThoai: '0912333444',
        email: 'mylinh@clinic.vn',
        diaChi: 'Hà Nội',
        chuyenKhoa: 'Tim mạch',
        soChungChi: 'BS020',
        capHocVan: 'Bác sĩ',
        namKinhNghiem: 5,
      },

      // Da liễu (3 người)
      {
        tenDangNhap: 'bacsi_linh_2',
        matKhau: 'Bacsi@123',
        hoTen: 'Trịnh Anh Tuấn',
        dienThoai: '0913444555',
        email: 'anhtuanmd@clinic.vn',
        diaChi: 'Hà Nội',
        chuyenKhoa: 'Da liễu',
        soChungChi: 'BS007',
        capHocVan: 'Thạc sĩ',
        namKinhNghiem: 7,
      },
      {
        tenDangNhap: 'bacsi_linh_3',
        matKhau: 'Bacsi@123',
        hoTen: 'Hà Thùy Dung',
        dienThoai: '0914555666',
        email: 'thuyldung@clinic.vn',
        diaChi: 'Hà Nội',
        chuyenKhoa: 'Da liễu',
        soChungChi: 'BS021',
        capHocVan: 'Bác sĩ',
        namKinhNghiem: 4,
      },

      // Nhi khoa (3 người)
      {
        tenDangNhap: 'bacsi_tuan_2',
        matKhau: 'Bacsi@123',
        hoTen: 'Ngô Văn Sơn',
        dienThoai: '0915666777',
        email: 'vanhson@clinic.vn',
        diaChi: 'Hà Nội',
        chuyenKhoa: 'Nhi khoa',
        soChungChi: 'BS008',
        capHocVan: 'Thạc sĩ',
        namKinhNghiem: 9,
      },
      {
        tenDangNhap: 'bacsi_tuan_3',
        matKhau: 'Bacsi@123',
        hoTen: 'Phạm Thị Hường',
        dienThoai: '0916777888',
        email: 'thuonghh@clinic.vn',
        diaChi: 'Hà Nội',
        chuyenKhoa: 'Nhi khoa',
        soChungChi: 'BS022',
        capHocVan: 'Bác sĩ',
        namKinhNghiem: 3,
      },

      // Nha khoa (3 người)
      {
        tenDangNhap: 'bacsi_huong_2',
        matKhau: 'Bacsi@123',
        hoTen: 'Đỗ Minh Quân',
        dienThoai: '0917888999',
        email: 'mquandent@clinic.vn',
        diaChi: 'Hà Nội',
        chuyenKhoa: 'Nha khoa',
        soChungChi: 'BS009',
        capHocVan: 'Thạc sĩ',
        namKinhNghiem: 6,
      },
      {
        tenDangNhap: 'bacsi_huong_3',
        matKhau: 'Bacsi@123',
        hoTen: 'Tạ Vân Anh',
        dienThoai: '0918999010',
        email: 'vananh@clinic.vn',
        diaChi: 'Hà Nội',
        chuyenKhoa: 'Nha khoa',
        soChungChi: 'BS023',
        capHocVan: 'Bác sĩ',
        namKinhNghiem: 2,
      },

      // Tai Mũi Họng (3 người)
      {
        tenDangNhap: 'bacsi_minh_2',
        matKhau: 'Bacsi@123',
        hoTen: 'Dương Văn Đức',
        dienThoai: '0919010121',
        email: 'ducduc@clinic.vn',
        diaChi: 'Hà Nội',
        chuyenKhoa: 'Tai Mũi Họng',
        soChungChi: 'BS010',
        capHocVan: 'Thạc sĩ',
        namKinhNghiem: 8,
      },
      {
        tenDangNhap: 'bacsi_minh_3',
        matKhau: 'Bacsi@123',
        hoTen: 'Lý Hồng Phúc',
        dienThoai: '0920121232',
        email: 'hongphuc@clinic.vn',
        diaChi: 'Hà Nội',
        chuyenKhoa: 'Tai Mũi Họng',
        soChungChi: 'BS024',
        capHocVan: 'Bác sĩ',
        namKinhNghiem: 4,
      },
    ];

    console.log('Tạo bác sĩ mới...\n');
    let createdCount = 0;

    for (const docData of newDoctorsData) {
      try {
        // Tìm chuyên khoa
        const specialty = specialties.find(s => s.TenChuyenKhoa === docData.chuyenKhoa);
        if (!specialty) {
          console.log(`  Chuyên khoa "${docData.chuyenKhoa}" không tìm thấy`);
          continue;
        }

        // Kiểm tra xem bác sĩ đã tồn tại không (theo số chứng chỉ)
        const existing = await db.BacSi.findOne({
          where: { SoChungChi: docData.soChungChi }
        });
        if (existing) {
          console.log(`  ⏭️  Bác sĩ ${docData.hoTen} (${docData.soChungChi}) đã tồn tại, bỏ qua`);
          continue;
        }

        // Tạo người dùng
        const nguoiDung = await db.NguoiDung.create({
          HoTen: docData.hoTen,
          DienThoai: docData.dienThoai,
          Email: docData.email,
          DiaChi: docData.diaChi,
          GioiTinh: docData.hoTen.includes('Thị') || docData.hoTen.includes('Vân') || docData.hoTen.includes('Linh') || docData.hoTen.includes('Dung') || docData.hoTen.includes('Anh') ? 'Nữ' : 'Nam',
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

        console.log(`  Tạo bác sĩ: ${docData.hoTen} | ${docData.chuyenKhoa} | ${docData.capHocVan} | ${docData.namKinhNghiem} năm KN`);
        createdCount++;
      } catch (error) {
        console.log(`  Lỗi tạo bác sĩ ${docData.hoTen}: ${error.message}`);
      }
    }

    console.log(`\nĐã thêm ${createdCount} bác sĩ mới\n`);

    // Tạo lịch làm việc cho bác sĩ mới
    console.log('Tạo lịch làm việc cho bác sĩ mới...');
    const allDoctors = await db.BacSi.findAll();
    const today = new Date(2026, 1, 24); // 24/02/2026
    let scheduleCount = 0;

    for (const doctor of allDoctors) {
      // Kiểm tra xem bác sĩ đã có lịch làm việc chưa
      const existingSchedules = await db.LichLamViecBacSi.count({
        where: { BacSiId: doctor.BacSiId }
      });

      if (existingSchedules > 0) {
        continue; // Bỏ qua nếu đã có lịch
      }

      // Tạo lịch cho 5 ngày
      for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
        const workDate = new Date(today);
        workDate.setDate(workDate.getDate() + dayOffset);

        // Sáng (08:00 - 12:00)
        await db.LichLamViecBacSi.create({
          BacSiId: doctor.BacSiId,
          NgayLamViec: workDate,
          CaLam: 'Sang',
          GioBatDau: '08:00',
          GioKetThuc: '12:00',
          TrangThai: 'HoatDong',
        });

        // Chiều (14:00 - 17:00)
        await db.LichLamViecBacSi.create({
          BacSiId: doctor.BacSiId,
          NgayLamViec: workDate,
          CaLam: 'Chieu',
          GioBatDau: '14:00',
          GioKetThuc: '17:00',
          TrangThai: 'HoatDong',
        });

        scheduleCount += 2;
      }
    }

    console.log(`Đã tạo lịch làm việc\n`);

    console.log('=' * 50);
    console.log('Đã hoàn tất thêm nhân sự!');
    console.log('=' * 50);

    process.exit(0);
  } catch (error) {
    console.error('Lỗi:', error);
    process.exit(1);
  }
}

addMoreDoctors();
