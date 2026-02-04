-- ============================================================
-- HỆ THỐNG QUẢN LÝ PHÒNG KHÁM VÀ ĐẶT LỊCH KHÁM BỆNH
-- Database Schema (MySQL 8.0) - Tên bảng tiếng Việt không dấu
-- ============================================================

-- Tạo Database
CREATE DATABASE IF NOT EXISTS clinic_management;
USE clinic_management;

-- ============================================================
-- 1. NGUOI_DUNG (Thông tin người dùng)
-- ============================================================
CREATE TABLE nguoi_dung (
    nguoi_dung_id INT PRIMARY KEY AUTO_INCREMENT,
    ho_ten VARCHAR(100) NOT NULL,
    gioi_tinh ENUM('NAM', 'NU', 'KHAC') DEFAULT 'KHAC',
    dien_thoai VARCHAR(20),
    email VARCHAR(100),
    dia_chi TEXT,
    thanh_pho VARCHAR(50),
    ngay_sinh DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ho_ten (ho_ten),
    INDEX idx_dien_thoai (dien_thoai),
    INDEX idx_email (email)
);

-- ============================================================
-- 2. TAI_KHOAN (Quản lý tài khoản và phân quyền)
-- ============================================================
CREATE TABLE tai_khoan (
    tai_khoan_id INT PRIMARY KEY AUTO_INCREMENT,
    nguoi_dung_id INT NOT NULL UNIQUE,
    ten_dang_nhap VARCHAR(50) UNIQUE NOT NULL,
    mat_khau_hash VARCHAR(255) NOT NULL,
    vai_tro ENUM('QUAN_TRI', 'LE_TAN', 'BAC_SI') NOT NULL,
    trang_thai ENUM('HOAT_DONG', 'KHONG_HOAT_DONG') DEFAULT 'HOAT_DONG',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    INDEX idx_ten_dang_nhap (ten_dang_nhap),
    INDEX idx_vai_tro (vai_tro),
    INDEX idx_trang_thai (trang_thai)
);

-- ============================================================
-- 3. CHUYEN_KHOA (Quản lý chuyên khoa)
-- ============================================================
CREATE TABLE chuyen_khoa (
    chuyen_khoa_id INT PRIMARY KEY AUTO_INCREMENT,
    ten_chuyen_khoa VARCHAR(100) NOT NULL UNIQUE,
    mo_ta TEXT,
    trang_thai ENUM('HOAT_DONG', 'KHONG_HOAT_DONG') DEFAULT 'HOAT_DONG',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ten_chuyen_khoa (ten_chuyen_khoa),
    INDEX idx_trang_thai (trang_thai)
);

-- ============================================================
-- 4. BAC_SI (Quản lý bác sĩ)
-- ============================================================
CREATE TABLE bac_si (
    bac_si_id INT PRIMARY KEY AUTO_INCREMENT,
    nguoi_dung_id INT NOT NULL UNIQUE,
    so_chung_chi VARCHAR(50) UNIQUE NOT NULL,
    cap_hoc_van VARCHAR(100),
    nam_kinh_nghiem INT,
    tieu_su TEXT,
    trang_thai ENUM('HOAT_DONG', 'KHONG_HOAT_DONG', 'NGHI_PHEP') DEFAULT 'HOAT_DONG',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    INDEX idx_so_chung_chi (so_chung_chi),
    INDEX idx_trang_thai (trang_thai)
);

-- ============================================================
-- 5. BAC_SI_CHUYEN_KHOA (Gán bác sĩ vào chuyên khoa)
-- ============================================================
CREATE TABLE bac_si_chuyen_khoa (
    bac_si_chuyen_khoa_id INT PRIMARY KEY AUTO_INCREMENT,
    bac_si_id INT NOT NULL,
    chuyen_khoa_id INT NOT NULL,
    la_chuyen_mon_chinh BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bac_si_id) REFERENCES bac_si(bac_si_id) ON DELETE CASCADE,
    FOREIGN KEY (chuyen_khoa_id) REFERENCES chuyen_khoa(chuyen_khoa_id) ON DELETE CASCADE,
    UNIQUE KEY unique_bac_si_chuyen_khoa (bac_si_id, chuyen_khoa_id),
    INDEX idx_chuyen_khoa_id (chuyen_khoa_id)
);

-- ============================================================
-- 6. BENH_NHAN (Quản lý bệnh nhân)
-- ============================================================
CREATE TABLE benh_nhan (
    benh_nhan_id INT PRIMARY KEY AUTO_INCREMENT,
    ma_benh_nhan VARCHAR(20) UNIQUE NOT NULL,
    ho_ten VARCHAR(100) NOT NULL,
    ngay_sinh DATE,
    gioi_tinh ENUM('NAM', 'NU', 'KHAC'),
    dien_thoai VARCHAR(20),
    email VARCHAR(100),
    dia_chi TEXT,
    thanh_pho VARCHAR(50),
    tien_su_benh_ly TEXT,
    di_ung TEXT,
    ghi_chu TEXT,
    trang_thai ENUM('HOAT_DONG', 'KHONG_HOAT_DONG') DEFAULT 'HOAT_DONG',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ma_benh_nhan (ma_benh_nhan),
    INDEX idx_ho_ten (ho_ten),
    INDEX idx_dien_thoai (dien_thoai),
    INDEX idx_email (email)
);

-- ============================================================
-- 7. LICH_LAM_VIEC_BAC_SI (Lịch làm việc của bác sĩ)
-- ============================================================
CREATE TABLE lich_lam_viec_bac_si (
    lich_lam_viec_id INT PRIMARY KEY AUTO_INCREMENT,
    bac_si_id INT NOT NULL,
    ngay_lam_viec DATE NOT NULL,
    ca_lam ENUM('SANG', 'CHIEU', 'TOI') NOT NULL,
    gio_bat_dau TIME NOT NULL,
    gio_ket_thuc TIME NOT NULL,
    so_benh_nhan_toi_da INT DEFAULT 10,
    trang_thai ENUM('HOAT_DONG', 'HUY') DEFAULT 'HOAT_DONG',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bac_si_id) REFERENCES bac_si(bac_si_id) ON DELETE CASCADE,
    UNIQUE KEY unique_bac_si_ngay_ca (bac_si_id, ngay_lam_viec, ca_lam),
    INDEX idx_bac_si_id (bac_si_id),
    INDEX idx_ngay_lam_viec (ngay_lam_viec),
    INDEX idx_ca_lam (ca_lam)
);

-- ============================================================
-- 8. LICH_KHAM (Lịch khám bệnh)
-- ============================================================
CREATE TABLE lich_kham (
    lich_kham_id INT PRIMARY KEY AUTO_INCREMENT,
    ma_lich_kham VARCHAR(20) UNIQUE NOT NULL,
    benh_nhan_id INT NOT NULL,
    bac_si_id INT NOT NULL,
    chuyen_khoa_id INT NOT NULL,
    ngay_kham DATE NOT NULL,
    ca_kham ENUM('SANG', 'CHIEU', 'TOI') NOT NULL,
    gio_kham TIME,
    trieu_chung TEXT,
    trang_thai ENUM('CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DA_KHAM', 'DA_HUY') DEFAULT 'CHO_XAC_NHAN',
    ly_do_huy TEXT,
    ghi_chu TEXT,
    tao_boi INT,
    xac_nhan_boi INT,
    huy_boi INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    thoi_gian_xac_nhan TIMESTAMP NULL,
    thoi_gian_huy TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (benh_nhan_id) REFERENCES benh_nhan(benh_nhan_id) ON DELETE CASCADE,
    FOREIGN KEY (bac_si_id) REFERENCES bac_si(bac_si_id),
    FOREIGN KEY (chuyen_khoa_id) REFERENCES chuyen_khoa(chuyen_khoa_id),
    FOREIGN KEY (tao_boi) REFERENCES tai_khoan(tai_khoan_id),
    FOREIGN KEY (xac_nhan_boi) REFERENCES tai_khoan(tai_khoan_id),
    FOREIGN KEY (huy_boi) REFERENCES tai_khoan(tai_khoan_id),
    UNIQUE KEY unique_ma_lich_kham (ma_lich_kham),
    INDEX idx_benh_nhan_id (benh_nhan_id),
    INDEX idx_bac_si_id (bac_si_id),
    INDEX idx_ngay_kham (ngay_kham),
    INDEX idx_trang_thai (trang_thai),
    INDEX idx_chuyen_khoa_id (chuyen_khoa_id),
    INDEX idx_created_at (created_at),
    INDEX idx_thoi_gian_huy (thoi_gian_huy)
);

-- ============================================================
-- 9. HO_SO_KHAM_BENH (Hồ sơ khám bệnh)
-- ============================================================
CREATE TABLE ho_so_kham_benh (
    ho_so_id INT PRIMARY KEY AUTO_INCREMENT,
    ma_ho_so VARCHAR(20) UNIQUE NOT NULL,
    lich_kham_id INT NOT NULL UNIQUE,
    benh_nhan_id INT NOT NULL,
    bac_si_id INT NOT NULL,
    trieu_chung TEXT NOT NULL,
    chan_doan TEXT NOT NULL,
    ke_hoach_dieu_tri TEXT,
    ket_luan TEXT,
    ghi_chu TEXT,
    ngay_kham TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lich_kham_id) REFERENCES lich_kham(lich_kham_id) ON DELETE CASCADE,
    FOREIGN KEY (benh_nhan_id) REFERENCES benh_nhan(benh_nhan_id) ON DELETE CASCADE,
    FOREIGN KEY (bac_si_id) REFERENCES bac_si(bac_si_id),
    INDEX idx_benh_nhan_id (benh_nhan_id),
    INDEX idx_bac_si_id (bac_si_id),
    INDEX idx_lich_kham_id (lich_kham_id),
    INDEX idx_ngay_kham (ngay_kham)
);

-- ============================================================
-- 10. DON_THUOC (Đơn thuốc)
-- ============================================================
CREATE TABLE don_thuoc (
    don_thuoc_id INT PRIMARY KEY AUTO_INCREMENT,
    ma_don_thuoc VARCHAR(20) UNIQUE NOT NULL,
    ho_so_id INT NOT NULL,
    ten_thuoc VARCHAR(100) NOT NULL,
    lieu_luong VARCHAR(50),
    so_luong INT,
    don_vi VARCHAR(20),
    huong_dan_su_dung TEXT,
    thoi_gian_dung VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ho_so_id) REFERENCES ho_so_kham_benh(ho_so_id) ON DELETE CASCADE,
    INDEX idx_ho_so_id (ho_so_id)
);

-- ============================================================
-- 11. THONG_BAO (Thông báo và nhắc lịch)
-- ============================================================
CREATE TABLE thong_bao (
    thong_bao_id INT PRIMARY KEY AUTO_INCREMENT,
    tai_khoan_id INT NOT NULL,
    lich_kham_id INT,
    loai_thong_bao ENUM('NHAC_LICH', 'LICH_DA_XAC_NHAN', 'LICH_DA_HUY', 'LICH_DA_KHAM', 'CANH_BAO') DEFAULT 'CANH_BAO',
    tieu_de VARCHAR(200),
    noi_dung TEXT NOT NULL,
    da_doc BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    doc_luc TIMESTAMP NULL,
    FOREIGN KEY (tai_khoan_id) REFERENCES tai_khoan(tai_khoan_id) ON DELETE CASCADE,
    FOREIGN KEY (lich_kham_id) REFERENCES lich_kham(lich_kham_id) ON DELETE SET NULL,
    INDEX idx_tai_khoan_id (tai_khoan_id),
    INDEX idx_da_doc (da_doc),
    INDEX idx_created_at (created_at)
);

-- ============================================================
-- 12. NHAT_KY_HOAT_DONG (Ghi log hoạt động)
-- ============================================================
CREATE TABLE nhat_ky_hoat_dong (
    nhat_ky_id INT PRIMARY KEY AUTO_INCREMENT,
    tai_khoan_id INT,
    hanh_dong VARCHAR(100) NOT NULL,
    loai_entity VARCHAR(50),
    entity_id INT,
    gia_tri_cu JSON,
    gia_tri_moi JSON,
    dia_chi_ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tai_khoan_id) REFERENCES tai_khoan(tai_khoan_id) ON DELETE SET NULL,
    INDEX idx_tai_khoan_id (tai_khoan_id),
    INDEX idx_loai_entity (loai_entity),
    INDEX idx_created_at (created_at)
);

-- ============================================================
-- INSERT DỮ LIỆU MẪU
-- ============================================================

-- Insert Chuyên khoa
INSERT INTO chuyen_khoa (ten_chuyen_khoa, mo_ta) VALUES
('Tim Mach', 'Chuyen khoa ve benh tim va mach mau'),
('Ho Hap', 'Chuyen khoa ve benh ho hap'),
('Tieu Hoa', 'Chuyen khoa ve benh tieu hoa'),
('Ngoai Da', 'Chuyen khoa ve benh da lieu'),
('Nhi Khoa', 'Chuyen khoa ve benh nhi');

-- Insert Người dùng
INSERT INTO nguoi_dung (ho_ten, gioi_tinh, dien_thoai, email) VALUES
('Quan Tri Vien', 'NAM', '0900000001', 'admin@clinic.com'),
('Nguyen Thi Le Tan', 'NU', '0900000002', 'receptionist@clinic.com'),
('TS. Tran Van A', 'NAM', '0900000003', 'doctor1@clinic.com'),
('ThS. Le Thi B', 'NU', '0900000004', 'doctor2@clinic.com'),
('TS. Pham Van C', 'NAM', '0900000005', 'doctor3@clinic.com');

-- Insert Tài khoản
INSERT INTO tai_khoan (nguoi_dung_id, ten_dang_nhap, mat_khau_hash, vai_tro, trang_thai) VALUES
(1, 'admin', '$2b$10$hashedpassword1', 'QUAN_TRI', 'HOAT_DONG'),
(2, 'receptionist1', '$2b$10$hashedpassword2', 'LE_TAN', 'HOAT_DONG'),
(3, 'doctor1', '$2b$10$hashedpassword3', 'BAC_SI', 'HOAT_DONG'),
(4, 'doctor2', '$2b$10$hashedpassword4', 'BAC_SI', 'HOAT_DONG'),
(5, 'doctor3', '$2b$10$hashedpassword5', 'BAC_SI', 'HOAT_DONG');

-- Insert Bác sĩ
INSERT INTO bac_si (nguoi_dung_id, so_chung_chi, cap_hoc_van, nam_kinh_nghiem, tieu_su, trang_thai) VALUES
(3, 'LIC001', 'Tien Si Y hoc', 10, 'Bac si chuyen khoa Tim Mach', 'HOAT_DONG'),
(4, 'LIC002', 'Thac Si Y hoc', 7, 'Bac si chuyen khoa Ho Hap', 'HOAT_DONG'),
(5, 'LIC003', 'Tien Si Y hoc', 12, 'Bac si chuyen khoa Tieu Hoa', 'HOAT_DONG');

-- Insert Bác sĩ - Chuyên khoa
INSERT INTO bac_si_chuyen_khoa (bac_si_id, chuyen_khoa_id, la_chuyen_mon_chinh) VALUES
(1, 1, TRUE),   -- Bác sĩ 1 - Tim Mạch (chuyên)
(2, 2, TRUE),   -- Bác sĩ 2 - Hô Hấp (chuyên)
(3, 3, TRUE);   -- Bác sĩ 3 - Tiêu Hóa (chuyên)

-- Insert Bệnh nhân
INSERT INTO benh_nhan (ma_benh_nhan, ho_ten, ngay_sinh, gioi_tinh, dien_thoai, email, dia_chi, thanh_pho, trang_thai) VALUES
('P001', 'Nguyen Van X', '1990-05-15', 'NAM', '0912345678', 'patient1@email.com', 'Quan 1, TPHCM', 'TPHCM', 'HOAT_DONG'),
('P002', 'Tran Thi Y', '1985-08-20', 'NU', '0912345679', 'patient2@email.com', 'Quan 2, TPHCM', 'TPHCM', 'HOAT_DONG'),
('P003', 'Pham Van Z', '1995-12-10', 'NAM', '0912345680', 'patient3@email.com', 'Quan 3, TPHCM', 'TPHCM', 'HOAT_DONG');

-- Insert Lịch làm việc bác sĩ
INSERT INTO lich_lam_viec_bac_si (bac_si_id, ngay_lam_viec, ca_lam, gio_bat_dau, gio_ket_thuc, so_benh_nhan_toi_da, trang_thai) VALUES
(1, '2026-02-05', 'SANG', '08:00:00', '12:00:00', 10, 'HOAT_DONG'),
(1, '2026-02-05', 'CHIEU', '13:00:00', '17:00:00', 10, 'HOAT_DONG'),
(2, '2026-02-05', 'SANG', '08:00:00', '12:00:00', 10, 'HOAT_DONG'),
(3, '2026-02-06', 'SANG', '08:00:00', '12:00:00', 10, 'HOAT_DONG');

-- ============================================================
-- TẠO VIEWS
-- ============================================================

-- View: Danh sách bác sĩ với chuyên khoa
CREATE VIEW v_bac_si_chuyen_khoa AS
SELECT 
    bs.bac_si_id,
    nd.ho_ten,
    nd.dien_thoai,
    nd.email,
    bs.so_chung_chi,
    bs.cap_hoc_van,
    bs.nam_kinh_nghiem,
    GROUP_CONCAT(ck.ten_chuyen_khoa SEPARATOR ', ') as chuyen_khoa,
    bs.trang_thai
FROM bac_si bs
JOIN nguoi_dung nd ON bs.nguoi_dung_id = nd.nguoi_dung_id
LEFT JOIN bac_si_chuyen_khoa bsck ON bs.bac_si_id = bsck.bac_si_id
LEFT JOIN chuyen_khoa ck ON bsck.chuyen_khoa_id = ck.chuyen_khoa_id
GROUP BY bs.bac_si_id;

-- View: Danh sách lịch khám chi tiết
CREATE VIEW v_lich_kham_chi_tiet AS
SELECT 
    lk.lich_kham_id,
    lk.ma_lich_kham,
    bn.ma_benh_nhan,
    bn.ho_ten as ten_benh_nhan,
    nd.ho_ten as ten_bac_si,
    ck.ten_chuyen_khoa,
    lk.ngay_kham,
    lk.ca_kham,
    lk.gio_kham,
    lk.trieu_chung,
    lk.trang_thai
FROM lich_kham lk
JOIN benh_nhan bn ON lk.benh_nhan_id = bn.benh_nhan_id
JOIN bac_si bs ON lk.bac_si_id = bs.bac_si_id
JOIN nguoi_dung nd ON bs.nguoi_dung_id = nd.nguoi_dung_id
JOIN chuyen_khoa ck ON lk.chuyen_khoa_id = ck.chuyen_khoa_id;

-- View: Thống kê lịch khám theo bác sĩ
CREATE VIEW v_thong_ke_lich_kham_bac_si AS
SELECT 
    bs.bac_si_id,
    nd.ho_ten as ten_bac_si,
    COUNT(lk.lich_kham_id) as tong_lich_kham,
    SUM(CASE WHEN lk.trang_thai = 'DA_KHAM' THEN 1 ELSE 0 END) as lich_da_kham,
    SUM(CASE WHEN lk.trang_thai = 'DA_HUY' THEN 1 ELSE 0 END) as lich_da_huy,
    SUM(CASE WHEN lk.trang_thai = 'CHO_XAC_NHAN' THEN 1 ELSE 0 END) as lich_cho_xac_nhan,
    SUM(CASE WHEN lk.trang_thai = 'DA_XAC_NHAN' THEN 1 ELSE 0 END) as lich_da_xac_nhan
FROM bac_si bs
JOIN nguoi_dung nd ON bs.nguoi_dung_id = nd.nguoi_dung_id
LEFT JOIN lich_kham lk ON bs.bac_si_id = lk.bac_si_id
GROUP BY bs.bac_si_id;

-- ============================================================
-- TẠO INDEXES CHO PERFORMANCE
-- ============================================================

-- Index cho lịch khám theo ngày
CREATE INDEX idx_lich_kham_ngay_trang_thai ON lich_kham(ngay_kham, trang_thai);

-- Index cho lịch làm việc
CREATE INDEX idx_lich_lam_viec_ngay_trang_thai ON lich_lam_viec_bac_si(ngay_lam_viec, trang_thai);

-- Index cho hồ sơ khám bệnh
CREATE INDEX idx_ho_so_kham_ngay ON ho_so_kham_benh(ngay_kham);

-- ============================================================
-- END OF SCHEMA
-- ============================================================
