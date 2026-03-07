-- ============================================================
-- HỆ THỐNG QUẢN LÝ PHÒNG KHÁM VÀ ĐẶT LỊCH KHÁM BỆNH
-- Database Schema (MySQL 8.0) - Tối ưu & hợp lý hơn từ schema bạn gửi
-- ✅ Mục tiêu tối ưu:
-- 1) Tránh trùng dữ liệu người (Bệnh nhân/Bác sĩ dùng chung NguoiDung)
-- 2) Đặt lịch theo DATETIME (chặn trùng giờ chuẩn, dễ mở rộng)
-- 3) Đơn thuốc tách Header/Detail
-- 4) Index theo query thực tế + ràng buộc dữ liệu tốt hơn
-- ============================================================

-- Tạo Database
CREATE DATABASE IF NOT EXISTS QuanLyPhongKham
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE QuanLyPhongKham;

-- (Tuỳ chọn) Khi phát triển: xoá bảng theo thứ tự FK để tạo lại
SET FOREIGN_KEY_CHECKS = 0;

DROP VIEW IF EXISTS v_thong_ke_lich_kham_bac_si;
DROP VIEW IF EXISTS v_lich_kham_chi_tiet;
DROP VIEW IF EXISTS v_bac_si_chuyen_khoa;

DROP TABLE IF EXISTS DonThuocChiTiet;
DROP TABLE IF EXISTS DonThuoc;
DROP TABLE IF EXISTS HoSoKhamBenh;
DROP TABLE IF EXISTS ThongBao;
DROP TABLE IF EXISTS NhatKyHoatDong;
DROP TABLE IF EXISTS LichKham;
DROP TABLE IF EXISTS LichLamViecBacSi;
DROP TABLE IF EXISTS BenhNhan;
DROP TABLE IF EXISTS BacSiChuyenKhoa;
DROP TABLE IF EXISTS BacSi;
DROP TABLE IF EXISTS ChuyenKhoa;
DROP TABLE IF EXISTS TaiKhoan;
DROP TABLE IF EXISTS NguoiDung;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. NGUOI_DUNG (Thông tin cá nhân chung: dùng cho cả Bác sĩ/Lễ tân/Admin/Bệnh nhân)
-- ============================================================
CREATE TABLE NguoiDung (
    NguoiDungId INT PRIMARY KEY AUTO_INCREMENT,
    HoTen VARCHAR(100) NOT NULL,
    GioiTinh ENUM('Nam', 'Nu', 'Khac') DEFAULT 'Khac',
    DienThoai VARCHAR(20),
    Email VARCHAR(100),
    DiaChi TEXT,
    ThanhPho VARCHAR(50),
    NgaySinh DATE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Index theo tra cứu thường gặp
    INDEX idx_nd_ho_ten (HoTen),
    INDEX idx_nd_dien_thoai (DienThoai),
    INDEX idx_nd_email (Email)
) ENGINE=InnoDB;

-- ============================================================
-- 2. TAI_KHOAN (Tài khoản hệ thống - phân quyền nội bộ)
-- Ghi chú: bệnh nhân có thể có/không có tài khoản; nếu muốn bệnh nhân đăng nhập,
-- bạn có thể tạo thêm VaiTro 'BenhNhan' hoặc tạo bảng TaiKhoanBenhNhan riêng.
-- ============================================================
CREATE TABLE TaiKhoan (
    TaiKhoanId INT PRIMARY KEY AUTO_INCREMENT,
    NguoiDungId INT NOT NULL UNIQUE,
    TenDangNhap VARCHAR(50) UNIQUE NOT NULL,
    MatKhauHash VARCHAR(255) NOT NULL,
    VaiTro ENUM('QuanTri', 'LeTan', 'BacSi') NOT NULL,
    TrangThai ENUM('HoatDong', 'KhongHoatDong') DEFAULT 'HoatDong',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (NguoiDungId) REFERENCES NguoiDung(NguoiDungId) ON DELETE CASCADE,
    INDEX idx_tk_vai_tro (VaiTro),
    INDEX idx_tk_trang_thai (TrangThai)
) ENGINE=InnoDB;

-- ============================================================
-- 3. CHUYEN_KHOA
-- ============================================================
CREATE TABLE ChuyenKhoa (
    ChuyenKhoaId INT PRIMARY KEY AUTO_INCREMENT,
    TenChuyenKhoa VARCHAR(100) NOT NULL UNIQUE,
    MoTa TEXT,
    TrangThai ENUM('HoatDong', 'KhongHoatDong') DEFAULT 'HoatDong',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_ck_ten (TenChuyenKhoa),
    INDEX idx_ck_trang_thai (TrangThai)
) ENGINE=InnoDB;

-- ============================================================
-- 4. BAC_SI (Bác sĩ gắn với NguoiDung)
-- ============================================================
CREATE TABLE BacSi (
    BacSiId INT PRIMARY KEY AUTO_INCREMENT,
    NguoiDungId INT NOT NULL UNIQUE,
    SoChungChi VARCHAR(50) UNIQUE NOT NULL,
    CapHocVan VARCHAR(100),
    NamKinhNghiem INT,
    TieuSu TEXT,
    TrangThai ENUM('HoatDong', 'KhongHoatDong', 'NghiPhep') DEFAULT 'HoatDong',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (NguoiDungId) REFERENCES NguoiDung(NguoiDungId) ON DELETE CASCADE,
    INDEX idx_bs_so_chung_chi (SoChungChi),
    INDEX idx_bs_trang_thai (TrangThai)
) ENGINE=InnoDB;

-- ============================================================
-- 5. BAC_SI_CHUYEN_KHOA (N-N)
-- ============================================================
CREATE TABLE BacSiChuyenKhoa (
    BacSiChuyenKhoaId INT PRIMARY KEY AUTO_INCREMENT,
    BacSiId INT NOT NULL,
    ChuyenKhoaId INT NOT NULL,
    LaChuyenMonChinh BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (BacSiId) REFERENCES BacSi(BacSiId) ON DELETE CASCADE,
    FOREIGN KEY (ChuyenKhoaId) REFERENCES ChuyenKhoa(ChuyenKhoaId) ON DELETE CASCADE,

    UNIQUE KEY uq_bacsi_chuyenkhoa (BacSiId, ChuyenKhoaId),
    INDEX idx_bsck_chuyen_khoa (ChuyenKhoaId)
) ENGINE=InnoDB;

-- ============================================================
-- 6. BENH_NHAN
-- ✅ Tối ưu: Bệnh nhân cũng dùng NguoiDung làm thông tin cá nhân (không bị trùng dữ liệu)
-- ============================================================
CREATE TABLE BenhNhan (
    BenhNhanId INT PRIMARY KEY AUTO_INCREMENT,
    NguoiDungId INT NOT NULL UNIQUE,
    MaBenhNhan VARCHAR(20) UNIQUE NOT NULL,

    -- Thông tin riêng bệnh nhân
    TienSuBenhLy TEXT,
    DiUng TEXT,
    GhiChu TEXT,
    TrangThai ENUM('HoatDong', 'KhongHoatDong') DEFAULT 'HoatDong',

    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (NguoiDungId) REFERENCES NguoiDung(NguoiDungId) ON DELETE CASCADE,

    INDEX idx_bn_ma (MaBenhNhan),
    INDEX idx_bn_trang_thai (TrangThai)
) ENGINE=InnoDB;

-- ============================================================
-- 7. LICH_LAM_VIEC_BAC_SI
-- ✅ Giữ ca (Sang/Chieu/Toi) để dễ quản lý UI
-- ✅ Có GioBatDau/GioKetThuc + SlotMinutes để hệ thống tạo slot giờ
-- ============================================================
CREATE TABLE LichLamViecBacSi (
    LichLamViecId INT PRIMARY KEY AUTO_INCREMENT,
    BacSiId INT NOT NULL,
    NgayLamViec DATE NOT NULL,
    CaLam ENUM('Sang', 'Chieu', 'Toi') NOT NULL,
    GioBatDau TIME NOT NULL,
    GioKetThuc TIME NOT NULL,
    SlotMinutes INT NOT NULL DEFAULT 15,           -- độ dài 1 slot khám (phút)
    SoBenhNhanToiDa INT NOT NULL DEFAULT 10,
    TrangThai ENUM('HoatDong', 'Huy') DEFAULT 'HoatDong',

    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (BacSiId) REFERENCES BacSi(BacSiId) ON DELETE CASCADE,

    UNIQUE KEY uq_bs_ngay_ca (BacSiId, NgayLamViec, CaLam),
    INDEX idx_llv_bs_ngay (BacSiId, NgayLamViec),
    INDEX idx_llv_ngay_trang_thai (NgayLamViec, TrangThai)
) ENGINE=InnoDB;

-- ============================================================
-- 8. LICH_KHAM
-- ✅ Tối ưu lớn: dùng DATETIME thay cho CaKham+GioKham nullable
-- -> chặn trùng giờ chuẩn, dễ thống kê, dễ nhắc lịch
-- ============================================================
CREATE TABLE LichKham (
    LichKhamId INT PRIMARY KEY AUTO_INCREMENT,
    MaLichKham VARCHAR(20) UNIQUE NOT NULL,

    BenhNhanId INT NOT NULL,
    BacSiId INT NOT NULL,
    ChuyenKhoaId INT NOT NULL,

    ThoiGianBatDau DATETIME NOT NULL,
    ThoiGianKetThuc DATETIME NULL,  -- có thể tính theo SlotMinutes

    TrieuChung TEXT,
    TrangThai ENUM('ChoXacNhan', 'DaXacNhan', 'DaKham', 'DaHuy') DEFAULT 'ChoXacNhan',
    LyDoHuy TEXT,
    GhiChu TEXT,

    TaoBoi INT NULL,
    XacNhanBoi INT NULL,
    HuyBoi INT NULL,

    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ThoiGianXacNhan TIMESTAMP NULL,
    ThoiGianHuy TIMESTAMP NULL,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (BenhNhanId) REFERENCES BenhNhan(BenhNhanId) ON DELETE CASCADE,
    FOREIGN KEY (BacSiId) REFERENCES BacSi(BacSiId) ON DELETE RESTRICT,
    FOREIGN KEY (ChuyenKhoaId) REFERENCES ChuyenKhoa(ChuyenKhoaId) ON DELETE RESTRICT,

    FOREIGN KEY (TaoBoi) REFERENCES TaiKhoan(TaiKhoanId) ON DELETE SET NULL,
    FOREIGN KEY (XacNhanBoi) REFERENCES TaiKhoan(TaiKhoanId) ON DELETE SET NULL,
    FOREIGN KEY (HuyBoi) REFERENCES TaiKhoan(TaiKhoanId) ON DELETE SET NULL,

    -- Chặn trùng lịch theo giờ
    UNIQUE KEY uq_bs_time (BacSiId, ThoiGianBatDau),
    UNIQUE KEY uq_bn_time (BenhNhanId, ThoiGianBatDau),

    -- Index cho lọc danh sách
    INDEX idx_lk_bs_time (BacSiId, ThoiGianBatDau),
    INDEX idx_lk_bn_time (BenhNhanId, ThoiGianBatDau),
    INDEX idx_lk_ck_time (ChuyenKhoaId, ThoiGianBatDau),
    INDEX idx_lk_trang_thai (TrangThai),
    INDEX idx_lk_time_trang_thai (ThoiGianBatDau, TrangThai),
    INDEX idx_lk_created_at (CreatedAt),
    INDEX idx_lk_thoi_gian_huy (ThoiGianHuy)
) ENGINE=InnoDB;

-- ============================================================
-- 9. HO_SO_KHAM_BENH
-- ✅ 1 lịch khám -> tối đa 1 hồ sơ (UNIQUE LichKhamId)
-- ============================================================
CREATE TABLE HoSoKhamBenh (
    HoSoId INT PRIMARY KEY AUTO_INCREMENT,
    MaHoSo VARCHAR(20) UNIQUE NOT NULL,

    LichKhamId INT NOT NULL UNIQUE,
    BenhNhanId INT NOT NULL,
    BacSiId INT NOT NULL,

    TrieuChung TEXT NOT NULL,
    ChanDoan TEXT NOT NULL,
    KeHoachDieuTri TEXT,
    KetLuan TEXT,
    GhiChu TEXT,

    NgayKham DATETIME NOT NULL,  -- lấy từ lịch khám hoặc thời điểm tạo hồ sơ
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (LichKhamId) REFERENCES LichKham(LichKhamId) ON DELETE CASCADE,
    FOREIGN KEY (BenhNhanId) REFERENCES BenhNhan(BenhNhanId) ON DELETE CASCADE,
    FOREIGN KEY (BacSiId) REFERENCES BacSi(BacSiId) ON DELETE RESTRICT,

    INDEX idx_hs_bn_ngay (BenhNhanId, NgayKham),
    INDEX idx_hs_bs_ngay (BacSiId, NgayKham),
    INDEX idx_hs_ngay (NgayKham)
) ENGINE=InnoDB;

-- ============================================================
-- 10. DON_THUOC (Header) + DON_THUOC_CHI_TIET (Detail)
-- ✅ Tách chuẩn để sau này thêm metadata dễ
-- ============================================================
CREATE TABLE DonThuoc (
    DonThuocId INT PRIMARY KEY AUTO_INCREMENT,
    MaDonThuoc VARCHAR(20) UNIQUE NOT NULL,
    HoSoId INT NOT NULL,
    GhiChu TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (HoSoId) REFERENCES HoSoKhamBenh(HoSoId) ON DELETE CASCADE,
    UNIQUE KEY uq_donthuoc_hoso (HoSoId),
    INDEX idx_dt_hoso (HoSoId)
) ENGINE=InnoDB;

CREATE TABLE DonThuocChiTiet (
    DonThuocChiTietId INT PRIMARY KEY AUTO_INCREMENT,
    DonThuocId INT NOT NULL,
    TenThuoc VARCHAR(100) NOT NULL,
    LieuLuong VARCHAR(50),
    SoLuong INT,
    DonVi VARCHAR(20),
    HuongDanSuDung TEXT,
    ThoiGianDung VARCHAR(50),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (DonThuocId) REFERENCES DonThuoc(DonThuocId) ON DELETE CASCADE,
    INDEX idx_dtct_donthuoc (DonThuocId),
    INDEX idx_dtct_tenthuoc (TenThuoc)
) ENGINE=InnoDB;

-- ============================================================
-- 11. THONG_BAO
-- ✅ Index theo use-case: lấy chưa đọc theo tài khoản, sắp xếp mới nhất
-- ============================================================
CREATE TABLE ThongBao (
    ThongBaoId INT PRIMARY KEY AUTO_INCREMENT,
    TaiKhoanId INT NOT NULL,
    LichKhamId INT NULL,

    LoaiThongBao ENUM('NhacLich', 'LichDaXacNhan', 'LichDaHuy', 'LichDaKham', 'CanhBao') DEFAULT 'CanhBao',
    TieuDe VARCHAR(200),
    NoiDung TEXT NOT NULL,

    DaDoc BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DocLuc TIMESTAMP NULL,

    FOREIGN KEY (TaiKhoanId) REFERENCES TaiKhoan(TaiKhoanId) ON DELETE CASCADE,
    FOREIGN KEY (LichKhamId) REFERENCES LichKham(LichKhamId) ON DELETE SET NULL,

    INDEX idx_tb_tk_dadoc_created (TaiKhoanId, DaDoc, CreatedAt),
    INDEX idx_tb_created_at (CreatedAt)
) ENGINE=InnoDB;

-- ============================================================
-- 12. NHAT_KY_HOAT_DONG (Audit Log)
-- ============================================================
CREATE TABLE NhatKyHoatDong (
    NhatKyId INT PRIMARY KEY AUTO_INCREMENT,
    TaiKhoanId INT NULL,
    HanhDong VARCHAR(100) NOT NULL,
    LoaiEntity VARCHAR(50),
    EntityId INT,
    GiaTriCu JSON,
    GiaTriMoi JSON,
    DiaChiIp VARCHAR(45),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (TaiKhoanId) REFERENCES TaiKhoan(TaiKhoanId) ON DELETE SET NULL,

    INDEX idx_nk_tk_created (TaiKhoanId, CreatedAt),
    INDEX idx_nk_entity (LoaiEntity, EntityId),
    INDEX idx_nk_created (CreatedAt)
) ENGINE=InnoDB;

-- ============================================================
-- VIEWS
-- ============================================================

-- View: Danh sách bác sĩ với chuyên khoa
CREATE VIEW v_bac_si_chuyen_khoa AS
SELECT 
    bs.BacSiId,
    nd.HoTen,
    nd.DienThoai,
    nd.Email,
    bs.SoChungChi,
    bs.CapHocVan,
    bs.NamKinhNghiem,
    GROUP_CONCAT(ck.TenChuyenKhoa ORDER BY ck.TenChuyenKhoa SEPARATOR ', ') AS chuyen_khoa,
    bs.TrangThai
FROM BacSi bs
JOIN NguoiDung nd ON bs.NguoiDungId = nd.NguoiDungId
LEFT JOIN BacSiChuyenKhoa bsck ON bs.BacSiId = bsck.BacSiId
LEFT JOIN ChuyenKhoa ck ON bsck.ChuyenKhoaId = ck.ChuyenKhoaId
GROUP BY bs.BacSiId;

-- View: Danh sách lịch khám chi tiết
CREATE VIEW v_lich_kham_chi_tiet AS
SELECT 
    lk.LichKhamId,
    lk.MaLichKham,
    bn.MaBenhNhan,
    nd_bn.HoTen AS ten_benh_nhan,
    nd_bs.HoTen AS ten_bac_si,
    ck.TenChuyenKhoa,
    lk.ThoiGianBatDau,
    lk.ThoiGianKetThuc,
    lk.TrieuChung,
    lk.TrangThai
FROM LichKham lk
JOIN BenhNhan bn ON lk.BenhNhanId = bn.BenhNhanId
JOIN NguoiDung nd_bn ON bn.NguoiDungId = nd_bn.NguoiDungId
JOIN BacSi bs ON lk.BacSiId = bs.BacSiId
JOIN NguoiDung nd_bs ON bs.NguoiDungId = nd_bs.NguoiDungId
JOIN ChuyenKhoa ck ON lk.ChuyenKhoaId = ck.ChuyenKhoaId;

-- View: Thống kê lịch khám theo bác sĩ
CREATE VIEW v_thong_ke_lich_kham_bac_si AS
SELECT 
    bs.BacSiId,
    nd.HoTen AS ten_bac_si,
    COUNT(lk.LichKhamId) AS tong_lich_kham,
    SUM(CASE WHEN lk.TrangThai = 'DaKham' THEN 1 ELSE 0 END) AS lich_da_kham,
    SUM(CASE WHEN lk.TrangThai = 'DaHuy' THEN 1 ELSE 0 END) AS lich_da_huy,
    SUM(CASE WHEN lk.TrangThai = 'ChoXacNhan' THEN 1 ELSE 0 END) AS lich_cho_xac_nhan,
    SUM(CASE WHEN lk.TrangThai = 'DaXacNhan' THEN 1 ELSE 0 END) AS lich_da_xac_nhan
FROM BacSi bs
JOIN NguoiDung nd ON bs.NguoiDungId = nd.NguoiDungId
LEFT JOIN LichKham lk ON bs.BacSiId = lk.BacSiId
GROUP BY bs.BacSiId;

-- ============================================================
-- DỮ LIỆU MẪU (Cập nhật theo schema mới)
-- ============================================================

-- Chuyên khoa
INSERT INTO ChuyenKhoa (TenChuyenKhoa, MoTa) VALUES
('Tim Mach', 'Chuyen khoa ve benh tim va mach mau'),
('Ho Hap', 'Chuyen khoa ve benh ho hap'),
('Tieu Hoa', 'Chuyen khoa ve benh tieu hoa'),
('Ngoai Da', 'Chuyen khoa ve benh da lieu'),
('Nhi Khoa', 'Chuyen khoa ve benh nhi');

-- Người dùng (nội bộ + bệnh nhân đều nằm ở đây)
INSERT INTO NguoiDung (HoTen, GioiTinh, DienThoai, Email, ThanhPho, NgaySinh, DiaChi) VALUES
('Quan Tri Vien', 'Nam', '0900000001', 'admin@clinic.com', 'TPHCM', '1990-01-01', 'Quan 1'),
('Nguyen Thi Le Tan', 'Nu', '0900000002', 'receptionist@clinic.com', 'TPHCM', '1992-02-02', 'Quan 1'),
('TS. Tran Van A', 'Nam', '0900000003', 'doctor1@clinic.com', 'TPHCM', '1980-03-03', 'Quan 3'),
('ThS. Le Thi B', 'Nu', '0900000004', 'doctor2@clinic.com', 'TPHCM', '1985-04-04', 'Quan 5'),
('TS. Pham Van C', 'Nam', '0900000005', 'doctor3@clinic.com', 'TPHCM', '1978-05-05', 'Quan 7'),

('Nguyen Van X', 'Nam', '0912345678', 'patient1@email.com', 'TPHCM', '1990-05-15', 'Quan 1'),
('Tran Thi Y', 'Nu', '0912345679', 'patient2@email.com', 'TPHCM', '1985-08-20', 'Quan 2'),
('Pham Van Z', 'Nam', '0912345680', 'patient3@email.com', 'TPHCM', '1995-12-10', 'Quan 3');

-- Tài khoản nội bộ
INSERT INTO TaiKhoan (NguoiDungId, TenDangNhap, MatKhauHash, VaiTro, TrangThai) VALUES
(1, 'admin', '$2b$10$hashedpassword1', 'QuanTri', 'HoatDong'),
(2, 'receptionist1', '$2b$10$hashedpassword2', 'LeTan', 'HoatDong'),
(3, 'doctor1', '$2b$10$hashedpassword3', 'BacSi', 'HoatDong'),
(4, 'doctor2', '$2b$10$hashedpassword4', 'BacSi', 'HoatDong'),
(5, 'doctor3', '$2b$10$hashedpassword5', 'BacSi', 'HoatDong');

-- Bác sĩ
INSERT INTO BacSi (NguoiDungId, SoChungChi, CapHocVan, NamKinhNghiem, TieuSu, TrangThai) VALUES
(3, 'LIC001', 'Tien Si Y hoc', 10, 'Bac si chuyen khoa Tim Mach', 'HoatDong'),
(4, 'LIC002', 'Thac Si Y hoc', 7, 'Bac si chuyen khoa Ho Hap', 'HoatDong'),
(5, 'LIC003', 'Tien Si Y hoc', 12, 'Bac si chuyen khoa Tieu Hoa', 'HoatDong');

-- Bác sĩ - Chuyên khoa
INSERT INTO BacSiChuyenKhoa (BacSiId, ChuyenKhoaId, LaChuyenMonChinh) VALUES
(1, 1, TRUE),
(2, 2, TRUE),
(3, 3, TRUE);

-- Bệnh nhân (gắn NguoiDungId 6,7,8)
INSERT INTO BenhNhan (NguoiDungId, MaBenhNhan, TienSuBenhLy, DiUng, GhiChu, TrangThai) VALUES
(6, 'P001', 'Khong ro', 'Khong', NULL, 'HoatDong'),
(7, 'P002', 'Viem xoang', 'Penicillin', NULL, 'HoatDong'),
(8, 'P003', 'Dau da day', 'Khong', NULL, 'HoatDong');

-- Lịch làm việc bác sĩ (2026-02-05/06)
INSERT INTO LichLamViecBacSi (BacSiId, NgayLamViec, CaLam, GioBatDau, GioKetThuc, SlotMinutes, SoBenhNhanToiDa, TrangThai) VALUES
(1, '2026-02-05', 'Sang',  '08:00:00', '12:00:00', 15, 10, 'HoatDong'),
(1, '2026-02-05', 'Chieu', '13:00:00', '17:00:00', 15, 10, 'HoatDong'),
(2, '2026-02-05', 'Sang',  '08:00:00', '12:00:00', 15, 10, 'HoatDong'),
(3, '2026-02-06', 'Sang',  '08:00:00', '12:00:00', 15, 10, 'HoatDong');

-- Lịch khám (đặt theo giờ cụ thể)
INSERT INTO LichKham (
    MaLichKham, BenhNhanId, BacSiId, ChuyenKhoaId,
    ThoiGianBatDau, ThoiGianKetThuc, TrieuChung, TrangThai, TaoBoi
) VALUES
('A001', 1, 1, 1, '2026-02-05 08:00:00', '2026-02-05 08:15:00', 'Dau nguc, kho tho', 'ChoXacNhan', 2),
('A002', 2, 2, 2, '2026-02-05 08:15:00', '2026-02-05 08:30:00', 'Ho keo dai', 'DaXacNhan', 2),
('A003', 3, 3, 3, '2026-02-06 08:00:00', '2026-02-06 08:15:00', 'Dau bung, day hoi', 'ChoXacNhan', 2);

-- ============================================================
-- END OF SCHEMA
-- ============================================================