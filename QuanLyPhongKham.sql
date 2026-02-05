-- ============================================================
-- HỆ THỐNG QUẢN LÝ PHÒNG KHÁM VÀ ĐẶT LỊCH KHÁM BỆNH
-- Database Schema (MySQL 8.0) - Tên bảng tiếng Việt không dấu
-- ============================================================

-- Tạo Database
CREATE DATABASE IF NOT EXISTS QuanLyPhongKham;
USE QuanLyPhongKham;

-- ============================================================
-- 1. NGUOI_DUNG (Thông tin người dùng)
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
    INDEX idx_ho_ten (HoTen),
    INDEX idx_dien_thoai (DienThoai),
    INDEX idx_email (Email)
);

-- ============================================================
-- 2. TAI_KHOAN (Quản lý tài khoản và phân quyền)
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
    INDEX idx_ten_dang_nhap (TenDangNhap),
    INDEX idx_vai_tro (VaiTro),
    INDEX idx_trang_thai (TrangThai)
);

-- ============================================================
-- 3. CHUYEN_KHOA (Quản lý chuyên khoa)
-- ============================================================
CREATE TABLE ChuyenKhoa (
    ChuyenKhoaId INT PRIMARY KEY AUTO_INCREMENT,
    TenChuyenKhoa VARCHAR(100) NOT NULL UNIQUE,
    MoTa TEXT,
    TrangThai ENUM('HoatDong', 'KhongHoatDong') DEFAULT 'HoatDong',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ten_chuyen_khoa (TenChuyenKhoa),
    INDEX idx_trang_thai (TrangThai)
);

-- ============================================================
-- 4. BAC_SI (Quản lý bác sĩ)
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
    INDEX idx_so_chung_chi (SoChungChi),
    INDEX idx_trang_thai (TrangThai)
);

-- ============================================================
-- 5. BAC_SI_CHUYEN_KHOA (Gán bác sĩ vào chuyên khoa)
-- ============================================================
CREATE TABLE BacSiChuyenKhoa (
    BacSiChuyenKhoaId INT PRIMARY KEY AUTO_INCREMENT,
    BacSiId INT NOT NULL,
    ChuyenKhoaId INT NOT NULL,
    LaChuyenMonChinh BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (BacSiId) REFERENCES BacSi(BacSiId) ON DELETE CASCADE,
    FOREIGN KEY (ChuyenKhoaId) REFERENCES ChuyenKhoa(ChuyenKhoaId) ON DELETE CASCADE,
    UNIQUE KEY unique_bac_si_chuyen_khoa (BacSiId, ChuyenKhoaId),
    INDEX idx_chuyen_khoa_id (ChuyenKhoaId)
);

-- ============================================================
-- 6. BENH_NHAN (Quản lý bệnh nhân)
-- ============================================================
CREATE TABLE BenhNhan (
    BenhNhanId INT PRIMARY KEY AUTO_INCREMENT,
    MaBenhNhan VARCHAR(20) UNIQUE NOT NULL,
    HoTen VARCHAR(100) NOT NULL,
    NgaySinh DATE,
    GioiTinh ENUM('Nam', 'Nu', 'Khac'),
    DienThoai VARCHAR(20),
    Email VARCHAR(100),
    DiaChi TEXT,
    ThanhPho VARCHAR(50),
    TienSuBenhLy TEXT,
    DiUng TEXT,
    GhiChu TEXT,
    TrangThai ENUM('HoatDong', 'KhongHoatDong') DEFAULT 'HoatDong',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ma_benh_nhan (MaBenhNhan),
    INDEX idx_ho_ten (HoTen),
    INDEX idx_dien_thoai (DienThoai),
    INDEX idx_email (Email)
);

-- ============================================================
-- 7. LICH_LAM_VIEC_BAC_SI (Lịch làm việc của bác sĩ)
-- ============================================================
CREATE TABLE LichLamViecBacSi (
    LichLamViecId INT PRIMARY KEY AUTO_INCREMENT,
    BacSiId INT NOT NULL,
    NgayLamViec DATE NOT NULL,
    CaLam ENUM('Sang', 'Chieu', 'Toi') NOT NULL,
    GioBatDau TIME NOT NULL,
    GioKetThuc TIME NOT NULL,
    SoBenhNhanToiDa INT DEFAULT 10,
    TrangThai ENUM('HoatDong', 'Huy') DEFAULT 'HoatDong',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (BacSiId) REFERENCES BacSi(BacSiId) ON DELETE CASCADE,
    UNIQUE KEY unique_bac_si_ngay_ca (BacSiId, NgayLamViec, CaLam),
    INDEX idx_bac_si_id (BacSiId),
    INDEX idx_ngay_lam_viec (NgayLamViec),
    INDEX idx_ca_lam (CaLam)
);

-- ============================================================
-- 8. LICH_KHAM (Lịch khám bệnh)
-- ============================================================
CREATE TABLE LichKham (
    LichKhamId INT PRIMARY KEY AUTO_INCREMENT,
    MaLichKham VARCHAR(20) UNIQUE NOT NULL,
    BenhNhanId INT NOT NULL,
    BacSiId INT NOT NULL,
    ChuyenKhoaId INT NOT NULL,
    NgayKham DATE NOT NULL,
    CaKham ENUM('Sang', 'Chieu', 'Toi') NOT NULL,
    GioKham TIME,
    TrieuChung TEXT,
    TrangThai ENUM('ChoXacNhan', 'DaXacNhan', 'DaKham', 'DaHuy') DEFAULT 'ChoXacNhan',
    LyDoHuy TEXT,
    GhiChu TEXT,
    TaoBoi INT,
    XacNhanBoi INT,
    HuyBoi INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ThoiGianXacNhan TIMESTAMP NULL,
    ThoiGianHuy TIMESTAMP NULL,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (BenhNhanId) REFERENCES BenhNhan(BenhNhanId) ON DELETE CASCADE,
    FOREIGN KEY (BacSiId) REFERENCES BacSi(BacSiId),
    FOREIGN KEY (ChuyenKhoaId) REFERENCES ChuyenKhoa(ChuyenKhoaId),
    FOREIGN KEY (TaoBoi) REFERENCES TaiKhoan(TaiKhoanId),
    FOREIGN KEY (XacNhanBoi) REFERENCES TaiKhoan(TaiKhoanId),
    FOREIGN KEY (HuyBoi) REFERENCES TaiKhoan(TaiKhoanId),
    UNIQUE KEY unique_ma_lich_kham (MaLichKham),
    INDEX idx_benh_nhan_id (BenhNhanId),
    INDEX idx_bac_si_id (BacSiId),
    INDEX idx_ngay_kham (NgayKham),
    INDEX idx_trang_thai (TrangThai),
    INDEX idx_chuyen_khoa_id (ChuyenKhoaId),
    INDEX idx_created_at (CreatedAt),
    INDEX idx_thoi_gian_huy (ThoiGianHuy)
);

-- ============================================================
-- 9. HO_SO_KHAM_BENH (Hồ sơ khám bệnh)
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
    NgayKham TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (LichKhamId) REFERENCES LichKham(LichKhamId) ON DELETE CASCADE,
    FOREIGN KEY (BenhNhanId) REFERENCES BenhNhan(BenhNhanId) ON DELETE CASCADE,
    FOREIGN KEY (BacSiId) REFERENCES BacSi(BacSiId),
    INDEX idx_benh_nhan_id (BenhNhanId),
    INDEX idx_bac_si_id (BacSiId),
    INDEX idx_lich_kham_id (LichKhamId),
    INDEX idx_ngay_kham (NgayKham)
);

-- ============================================================
-- 10. DON_THUOC (Đơn thuốc)
-- ============================================================
CREATE TABLE DonThuoc (
    DonThuocId INT PRIMARY KEY AUTO_INCREMENT,
    MaDonThuoc VARCHAR(20) UNIQUE NOT NULL,
    HoSoId INT NOT NULL,
    TenThuoc VARCHAR(100) NOT NULL,
    LieuLuong VARCHAR(50),
    SoLuong INT,
    DonVi VARCHAR(20),
    HuongDanSuDung TEXT,
    ThoiGianDung VARCHAR(50),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (HoSoId) REFERENCES HoSoKhamBenh(HoSoId) ON DELETE CASCADE,
    INDEX idx_ho_so_id (HoSoId)
);

-- ============================================================
-- 11. THONG_BAO (Thông báo và nhắc lịch)
-- ============================================================
CREATE TABLE ThongBao (
    ThongBaoId INT PRIMARY KEY AUTO_INCREMENT,
    TaiKhoanId INT NOT NULL,
    LichKhamId INT,
    LoaiThongBao ENUM('NhacLich', 'LichDaXacNhan', 'LichDaHuy', 'LichDaKham', 'CanhBao') DEFAULT 'CanhBao',
    TieuDe VARCHAR(200),
    NoiDung TEXT NOT NULL,
    DaDoc BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DocLuc TIMESTAMP NULL,
    FOREIGN KEY (TaiKhoanId) REFERENCES TaiKhoan(TaiKhoanId) ON DELETE CASCADE,
    FOREIGN KEY (LichKhamId) REFERENCES LichKham(LichKhamId) ON DELETE SET NULL,
    INDEX idx_tai_khoan_id (TaiKhoanId),
    INDEX idx_da_doc (DaDoc),
    INDEX idx_created_at (CreatedAt)
);

-- ============================================================
-- 12. NHAT_KY_HOAT_DONG (Ghi log hoạt động)
-- ============================================================
CREATE TABLE NhatKyHoatDong (
    NhatKyId INT PRIMARY KEY AUTO_INCREMENT,
    TaiKhoanId INT,
    HanhDong VARCHAR(100) NOT NULL,
    LoaiEntity VARCHAR(50),
    EntityId INT,
    GiaTriCu JSON,
    GiaTriMoi JSON,
    DiaChiIp VARCHAR(45),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TaiKhoanId) REFERENCES TaiKhoan(TaiKhoanId) ON DELETE SET NULL,
    INDEX idx_tai_khoan_id (TaiKhoanId),
    INDEX idx_loai_entity (LoaiEntity),
    INDEX idx_created_at (CreatedAt)
);

-- ============================================================
-- INSERT DỮ LIỆU MẪU
-- ============================================================

-- Insert Chuyên khoa
INSERT INTO ChuyenKhoa (TenChuyenKhoa, MoTa) VALUES
('Tim Mach', 'Chuyen khoa ve benh tim va mach mau'),
('Ho Hap', 'Chuyen khoa ve benh ho hap'),
('Tieu Hoa', 'Chuyen khoa ve benh tieu hoa'),
('Ngoai Da', 'Chuyen khoa ve benh da lieu'),
('Nhi Khoa', 'Chuyen khoa ve benh nhi');

-- Insert Người dùng
INSERT INTO NguoiDung (HoTen, GioiTinh, DienThoai, Email) VALUES
('Quan Tri Vien', 'Nam', '0900000001', 'admin@clinic.com'),
('Nguyen Thi Le Tan', 'Nu', '0900000002', 'receptionist@clinic.com'),
('TS. Tran Van A', 'Nam', '0900000003', 'doctor1@clinic.com'),
('ThS. Le Thi B', 'Nu', '0900000004', 'doctor2@clinic.com'),
('TS. Pham Van C', 'Nam', '0900000005', 'doctor3@clinic.com');

-- Insert Tài khoản
INSERT INTO TaiKhoan (NguoiDungId, TenDangNhap, MatKhauHash, VaiTro, TrangThai) VALUES
(1, 'admin', '$2b$10$hashedpassword1', 'QuanTri', 'HoatDong'),
(2, 'receptionist1', '$2b$10$hashedpassword2', 'LeTan', 'HoatDong'),
(3, 'doctor1', '$2b$10$hashedpassword3', 'BacSi', 'HoatDong'),
(4, 'doctor2', '$2b$10$hashedpassword4', 'BacSi', 'HoatDong'),
(5, 'doctor3', '$2b$10$hashedpassword5', 'BacSi', 'HoatDong');

-- Insert Bác sĩ
INSERT INTO BacSi (NguoiDungId, SoChungChi, CapHocVan, NamKinhNghiem, TieuSu, TrangThai) VALUES
(3, 'LIC001', 'Tien Si Y hoc', 10, 'Bac si chuyen khoa Tim Mach', 'HoatDong'),
(4, 'LIC002', 'Thac Si Y hoc', 7, 'Bac si chuyen khoa Ho Hap', 'HoatDong'),
(5, 'LIC003', 'Tien Si Y hoc', 12, 'Bac si chuyen khoa Tieu Hoa', 'HoatDong');

-- Insert Bác sĩ - Chuyên khoa
INSERT INTO BacSiChuyenKhoa (BacSiId, ChuyenKhoaId, LaChuyenMonChinh) VALUES
(1, 1, TRUE),   -- Bác sĩ 1 - Tim Mạch (chuyên)
(2, 2, TRUE),   -- Bác sĩ 2 - Hô Hấp (chuyên)
(3, 3, TRUE);   -- Bác sĩ 3 - Tiêu Hóa (chuyên)

-- Insert Bệnh nhân
INSERT INTO BenhNhan (MaBenhNhan, HoTen, NgaySinh, GioiTinh, DienThoai, Email, DiaChi, ThanhPho, TrangThai) VALUES
('P001', 'Nguyen Van X', '1990-05-15', 'Nam', '0912345678', 'patient1@email.com', 'Quan 1, TPHCM', 'TPHCM', 'HoatDong'),
('P002', 'Tran Thi Y', '1985-08-20', 'Nu', '0912345679', 'patient2@email.com', 'Quan 2, TPHCM', 'TPHCM', 'HoatDong'),
('P003', 'Pham Van Z', '1995-12-10', 'Nam', '0912345680', 'patient3@email.com', 'Quan 3, TPHCM', 'TPHCM', 'HoatDong');

-- Insert Lịch làm việc bác sĩ
INSERT INTO LichLamViecBacSi (BacSiId, NgayLamViec, CaLam, GioBatDau, GioKetThuc, SoBenhNhanToiDa, TrangThai) VALUES
(1, '2026-02-05', 'Sang', '08:00:00', '12:00:00', 10, 'HoatDong'),
(1, '2026-02-05', 'Chieu', '13:00:00', '17:00:00', 10, 'HoatDong'),
(2, '2026-02-05', 'Sang', '08:00:00', '12:00:00', 10, 'HoatDong'),
(3, '2026-02-06', 'Sang', '08:00:00', '12:00:00', 10, 'HoatDong');

-- ============================================================
-- TẠO VIEWS
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
    GROUP_CONCAT(ck.TenChuyenKhoa SEPARATOR ', ') as chuyen_khoa,
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
    bn.HoTen as ten_benh_nhan,
    nd.HoTen as ten_bac_si,
    ck.TenChuyenKhoa,
    lk.NgayKham,
    lk.CaKham,
    lk.GioKham,
    lk.TrieuChung,
    lk.TrangThai
FROM LichKham lk
JOIN BenhNhan bn ON lk.BenhNhanId = bn.BenhNhanId
JOIN BacSi bs ON lk.BacSiId = bs.BacSiId
JOIN NguoiDung nd ON bs.NguoiDungId = nd.NguoiDungId
JOIN ChuyenKhoa ck ON lk.ChuyenKhoaId = ck.ChuyenKhoaId;

-- View: Thống kê lịch khám theo bác sĩ
CREATE VIEW v_thong_ke_lich_kham_bac_si AS
SELECT 
    bs.BacSiId,
    nd.HoTen as ten_bac_si,
    COUNT(lk.LichKhamId) as tong_lich_kham,
    SUM(CASE WHEN lk.TrangThai = 'DaKham' THEN 1 ELSE 0 END) as lich_da_kham,
    SUM(CASE WHEN lk.TrangThai = 'DaHuy' THEN 1 ELSE 0 END) as lich_da_huy,
    SUM(CASE WHEN lk.TrangThai = 'ChoXacNhan' THEN 1 ELSE 0 END) as lich_cho_xac_nhan,
    SUM(CASE WHEN lk.TrangThai = 'DaXacNhan' THEN 1 ELSE 0 END) as lich_da_xac_nhan
FROM BacSi bs
JOIN NguoiDung nd ON bs.NguoiDungId = nd.NguoiDungId
LEFT JOIN LichKham lk ON bs.BacSiId = lk.BacSiId
GROUP BY bs.BacSiId;

-- ============================================================
-- TẠO INDEXES CHO PERFORMANCE
-- ============================================================

-- Index cho lịch khám theo ngày
CREATE INDEX idx_lich_kham_ngay_trang_thai ON LichKham(NgayKham, TrangThai);

-- Index cho lịch làm việc
CREATE INDEX idx_lich_lam_viec_ngay_trang_thai ON LichLamViecBacSi(NgayLamViec, TrangThai);

-- Index cho hồ sơ khám bệnh
CREATE INDEX idx_ho_so_kham_ngay ON HoSoKhamBenh(NgayKham);

-- ============================================================
-- END OF SCHEMA
-- ============================================================
