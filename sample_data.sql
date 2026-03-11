-- ============================================================
-- DỮ LIỆU MẪU CHO HỆ THỐNG QUẢN LÝ PHÒNG KHÁM
-- Khớp với schema QuanLyPhongKham.sql (MySQL 8.0)
-- Mật khẩu mặc định tất cả tài khoản: 123456
-- ============================================================

USE QuanLyPhongKham;

-- ============================================================
-- DỌN SẠCH DỮ LIỆU CŨ (đúng thứ tự FK)
-- ============================================================
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE DonThuocChiTiet;
TRUNCATE TABLE DonThuoc;
TRUNCATE TABLE HoSoKhamBenh;
TRUNCATE TABLE ThongBao;
TRUNCATE TABLE NhatKyHoatDong;
TRUNCATE TABLE LichKham;
TRUNCATE TABLE LichLamViecBacSi;
TRUNCATE TABLE BacSiChuyenKhoa;
TRUNCATE TABLE BenhNhan;
TRUNCATE TABLE BacSi;
TRUNCATE TABLE TaiKhoan;
TRUNCATE TABLE NguoiDung;
TRUNCATE TABLE PhongKham;
TRUNCATE TABLE ChuyenKhoa;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- BƯỚC 1: Bảng không có FK (insert trước)
-- ============================================================

-- 1A. PHÒNG KHÁM
INSERT INTO PhongKham (TenPhongKham, MaPhongKham, DiaChi, SucChua, TrangThai, GhiChu) VALUES
('Phòng Khám 101', 'PK-101', 'Tầng 1', 1, 'HoatDong', 'Phòng nội khoa tầng 1'),
('Phòng Khám 201', 'PK-201', 'Tầng 2', 1, 'HoatDong', 'Phòng ngoại khoa tầng 2'),
('Phòng Khám 301', 'PK-301', 'Tầng 3', 1, 'HoatDong', 'Phòng nha khoa tầng 3'),
('Phòng Khám 102', 'PK-102', 'Tầng 1', 1, 'HoatDong', 'Phòng da liễu tầng 1'),
('Phòng Khám 202', 'PK-202', 'Tầng 2', 1, 'BaoTri', 'Đang bảo trì');

-- 1B. CHUYÊN KHOA (11 chuyên khoa khớp với AIService.js)
-- ID: 1=Tim mạch, 2=Da liễu, 3=Nhi khoa, 4=Nha khoa, 5=Tai Mũi Họng
--     6=Nội khoa, 7=Chỉnh hình, 8=Phụ khoa, 9=Tiêu hoá, 10=Tâm thần, 11=Hô hấp
INSERT INTO ChuyenKhoa (TenChuyenKhoa, MoTa, TrangThai) VALUES
('Tim mạch',     'Nhịp tim, đau ngực, huyết áp cao, yếu tay chân, chóng mặt liên quan tim',          'HoatDong'),
('Da liễu',     'Mụn, nổi mẩn, ngứa, nám, sẹo da, viêm da',                                       'HoatDong'),
('Nhi khoa',    'CHỈ cho trẻ em dưới 12 tuổi: sốt cao, ho, tiêu chảy ở trẻ, phát triển bất thường','HoatDong'),
('Nha khoa',    'Đau răng, mảng bám, chảy máu nướu, viêm lợi, mẻ xương hàm',                       'HoatDong'),
('Tai Mũi Họng','Ù tai, chảy máu mũi, ho kéo dài, hạt giọng, viêm amidan, chảy dịch tai',         'HoatDong'),
('Nội khoa',    'Sốt, cảm cúm, chán ăn, yếu cơ thể, buồn nôn, chóng mặt tổng quát',               'HoatDong'),
('Chỉnh hình',  'Gãy xương, bong gân, đau cột sống, đau khớp, chấn thương',                        'HoatDong'),
('Phụ khoa',    'Kinh nguyệt bất thường, mang thai, đau vùng chậu, khí hư',                        'HoatDong'),
('Tiêu hoá',    'Đau bụng, tiêu chảy ở người lớn, nôn, ợ chua, ợ hơi, táo bón, gan',              'HoatDong'),
('Tâm thần',    'Đau đầu, lo âu, stress, mất ngủ, trầm cảm, rối loạn tâm thần',                   'HoatDong'),
('Hô hấp',      'Ho, sốt, khó thở, viêm phổi, hen suyễn, đau ngực khi ho',                        'HoatDong');

-- ============================================================
-- BƯỚC 2: NguoiDung (gốc cho tất cả vai trò)
-- ============================================================
-- NguoiDungId 1-5: nhân viên (có TaiKhoan)
-- NguoiDungId 6-10: bệnh nhân
-- NguoiDungId 1-6: nhân viên (admin, quanly, letan, 3 bác sĩ)
INSERT INTO NguoiDung (HoTen, GioiTinh, DienThoai, Email, DiaChi, ThanhPho, NgaySinh) VALUES
('Nguyễn Văn An',    'Nam',  '0901111001', 'admin@phongkham.vn',    '01 Lê Lợi, Q.1',       'TP.HCM', '1980-03-15'),
('Phan Thị Quỳnh',   'Nu',   '0901111006', 'quanly@phongkham.vn',  '99 Lý Tự Trọng, Q.1',  'TP.HCM', '1982-05-10'),
('Trần Thị Bình',    'Nu',   '0901111002', 'letan@phongkham.vn',   '12 Nguyễn Trãi, Q.5',  'TP.HCM', '1992-07-20'),
('Lê Minh Châu',     'Nam',  '0901111003', 'bs.chau@phongkham.vn', '34 Hai Bà Trưng, Q.3', 'TP.HCM', '1978-11-05'),
('Phạm Thị Dung',    'Nu',   '0901111004', 'bs.dung@phongkham.vn', '56 Pasteur, Q.1',       'TP.HCM', '1985-04-30'),
('Hoàng Văn Em',     'Nam',  '0901111005', 'bs.em@phongkham.vn',   '78 Nam Kỳ Khởi Nghĩa', 'TP.HCM', '1983-09-12');

-- ============================================================
-- BƯỚC 3: TaiKhoan (FK -> NguoiDung)
-- Hash bcrypt cho mật khẩu '123456' (10 rounds)
-- ============================================================
INSERT INTO TaiKhoan (NguoiDungId, TenDangNhap, MatKhauHash, VaiTro, TrangThai) VALUES
(1, 'admin',   '$2b$10$r6Oi2EvyJdMEOfvxKLjCK.bwAuakyWdQYixYkQMsRVmMEt0Ns1QCm', 'QuanTri', 'HoatDong'),
(2, 'quanly',  '$2b$10$r6Oi2EvyJdMEOfvxKLjCK.bwAuakyWdQYixYkQMsRVmMEt0Ns1QCm', 'QuanLy',  'HoatDong'),
(3, 'letan',   '$2b$10$r6Oi2EvyJdMEOfvxKLjCK.bwAuakyWdQYixYkQMsRVmMEt0Ns1QCm', 'LeTan',   'HoatDong'),
(4, 'bs.chau', '$2b$10$r6Oi2EvyJdMEOfvxKLjCK.bwAuakyWdQYixYkQMsRVmMEt0Ns1QCm', 'BacSi',   'HoatDong'),
(5, 'bs.dung', '$2b$10$r6Oi2EvyJdMEOfvxKLjCK.bwAuakyWdQYixYkQMsRVmMEt0Ns1QCm', 'BacSi',   'HoatDong'),
(6, 'bs.em',   '$2b$10$r6Oi2EvyJdMEOfvxKLjCK.bwAuakyWdQYixYkQMsRVmMEt0Ns1QCm', 'BacSi',   'HoatDong');

-- ============================================================
-- BƯỚC 4: BacSi (FK -> NguoiDung)
-- ============================================================
-- BacSiId: NguoiDungId 4=Châu, 5=Dung, 6=Em
INSERT INTO BacSi (NguoiDungId, SoChungChi, CapHocVan, NamKinhNghiem, TieuSu, TrangThai) VALUES
(4, 'BS-HCM-001', 'Tiến sĩ Y khoa',   20, 'Chuyên gia Nội khoa, từng công tác tại BV Chợ Rẫy', 'HoatDong'),
(5, 'BS-HCM-002', 'Thạc sĩ Y học',    15, 'Bác sĩ Ngoại khoa, chuyên phẫu thuật tiêu hóa',     'HoatDong'),
(6, 'BS-HCM-003', 'Bác sĩ chuyên khoa I', 10, 'Bác sĩ Nha khoa, chuyên niềng răng thẩm mỹ',    'HoatDong');

-- ============================================================
-- BƯỚC 5: BacSiChuyenKhoa (FK -> BacSi, ChuyenKhoa)
-- ============================================================
INSERT INTO BacSiChuyenKhoa (BacSiId, ChuyenKhoaId, LaChuyenMonChinh) VALUES
(1, 6, TRUE),   -- BS Châu: Nội khoa (chính)
(1, 1, FALSE),  -- BS Châu: Tim mạch (phụ)
(2, 9, TRUE),   -- BS Dung: Tiêu hoá (chính)
(2, 7, FALSE),  -- BS Dung: Chỉnh hình (phụ)
(3, 4, TRUE),   -- BS Em: Nha khoa (chính)
(3, 2, FALSE);  -- BS Em: Da liễu (phụ)

-- ============================================================
-- BƯỚC 6: BenhNhan (bảng độc lập, không FK -> NguoiDung)
-- BenhNhanId tự tăng: 1=Phương, 2=Hùng, 3=Lan, 4=Minh, 5=Ngọc
-- ============================================================
INSERT INTO BenhNhan (MaBenhNhan, HoTen, NgaySinh, GioiTinh, CCCD, DienThoai, Email, DiaChi, ThanhPho, TienSuBenhLy, DiUng, GhiChu, TrangThai) VALUES
('BN-2026-001', 'Võ Thị Phương',  '1995-01-18', 'Nu',  '079195001001', '0911222001', 'phuong@gmail.com', '10 Cộng Hòa, Tân Bình',  'TP.HCM', 'Huyết áp cao, đang điều trị', 'Penicillin', 'Bệnh nhân tái khám mỗi tháng',     'HoatDong'),
('BN-2026-002', 'Đặng Quốc Hùng', '1998-06-25', 'Nam', '079198002002', '0911222002', 'hung@gmail.com',   '22 Lạc Long Quân, Q.11', 'TP.HCM', 'Tiểu đường type 2',           'Không có',   'Cần theo dõi đường huyết định kỳ', 'HoatDong'),
('BN-2026-003', 'Ngô Thị Lan',    '1990-12-10', 'Nu',  '079190003003', '0911222003', 'lan@gmail.com',    '33 Đinh Tiên Hoàng, BT', 'TP.HCM', 'Không có tiền sử bệnh',       'Không có',   'Lần đầu khám tại phòng khám',      'HoatDong'),
('BN-2026-004', 'Trịnh Văn Minh', '2000-08-05', 'Nam', '079200004004', '0911222004', 'minh@gmail.com',   '44 Phan Xích Long, PN',  'TP.HCM', 'Viêm amidan mạn tính',        'Aspirin',    'Theo dõi sau phẫu thuật',          'HoatDong'),
('BN-2026-005', 'Bùi Thị Ngọc',   '1993-03-22', 'Nu',  '079193005005', '0911222005', 'ngoc@gmail.com',   '55 Nguyễn Đình Chiểu',   'TP.HCM', 'Dị ứng theo mùa',             'Phấn hoa',   'Khám định kỳ 6 tháng/lần',         'HoatDong');

-- ============================================================
-- BƯỚC 7: LichLamViecBacSi (FK -> BacSi)
-- ============================================================
INSERT INTO LichLamViecBacSi (BacSiId, NgayLamViec, CaLam, GioBatDau, GioKetThuc, SlotMinutes, SoBenhNhanToiDa, TrangThai) VALUES
-- BS Châu (BacSiId=1): hôm nay + ngày mai
(1, CURDATE(),                   'Sang',  '08:00:00', '12:00:00', 30, 8, 'HoatDong'),
(1, CURDATE(),                   'Chieu', '13:30:00', '17:00:00', 30, 6, 'HoatDong'),
(1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Sang',  '08:00:00', '12:00:00', 30, 8, 'HoatDong'),
-- BS Dung (BacSiId=2): hôm nay + ngày mai
(2, CURDATE(),                   'Sang',  '08:00:00', '11:30:00', 30, 6, 'HoatDong'),
(2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Chieu', '13:30:00', '17:00:00', 30, 6, 'HoatDong'),
-- BS Em (BacSiId=3): chiều hôm nay
(3, CURDATE(),                   'Chieu', '13:00:00', '17:00:00', 30, 8, 'HoatDong');

-- ============================================================
-- BƯỚC 8: LichKham (FK -> BenhNhan, BacSi, ChuyenKhoa, PhongKham, TaiKhoan)
-- ThoiGianBatDau: mix hôm nay + tương lai để test bảng "Lịch Khám Hôm Nay"
-- TaoBoi tham chiếu TaiKhoanId (letan=2, admin=1)
-- ============================================================
INSERT INTO LichKham (MaLichKham, BenhNhanId, BacSiId, ChuyenKhoaId, PhongKhamId, ThoiGianBatDau, ThoiGianKetThuc, TrieuChung, TrangThai, GhiChu, TaoBoi) VALUES
-- Hôm nay (để test "Lịch Khám Hôm Nay")
-- ChuyenKhoaId: 6=Nội khoa, 9=Tiêu hoá, 4=Nha khoa, 2=Da liễu
('LK-2026-001', 1, 1, 6, 1,
    CONCAT(CURDATE(), ' 08:30:00'), CONCAT(CURDATE(), ' 09:00:00'),
    'Đau đầu, chóng mặt, mệt mỏi kéo dài 3 ngày', 'DaXacNhan', 'Tái khám huyết áp', 2),

('LK-2026-002', 2, 1, 6, 1,
    CONCAT(CURDATE(), ' 09:00:00'), CONCAT(CURDATE(), ' 09:30:00'),
    'Khát nước nhiều, tiểu nhiều lần', 'DaXacNhan', 'Kiểm tra đường huyết', 2),

('LK-2026-003', 3, 2, 9, 2,
    CONCAT(CURDATE(), ' 08:30:00'), CONCAT(CURDATE(), ' 09:00:00'),
    'Đau bụng vùng thượng vị sau ăn', 'ChoXacNhan', '', 2),

('LK-2026-004', 4, 3, 4, 3,
    CONCAT(CURDATE(), ' 13:00:00'), CONCAT(CURDATE(), ' 13:30:00'),
    'Đau răng hàm dưới bên phải, ăn nhai khó khăn', 'DaXacNhan', 'Khám và nhổ răng khôn', 2),

('LK-2026-005', 5, 1, 2, 4,
    CONCAT(CURDATE(), ' 14:00:00'), CONCAT(CURDATE(), ' 14:30:00'),
    'Nổi mẩn đỏ, ngứa vùng da tay và chân', 'DaKham', 'Tái khám dị ứng', 2),

-- Ngày mai
('LK-2026-006', 1, 1, 6, 1,
    CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 08:30:00'),
    CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 09:00:00'),
    'Theo dõi huyết áp sau điều trị', 'ChoXacNhan', 'Lịch tái khám', 1),

('LK-2026-007', 3, 2, 9, 2,
    CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 13:30:00'),
    CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 14:00:00'),
    'Đau bụng tái phát sau 3 ngày uống thuốc', 'ChoXacNhan', '', 2),

-- Tuần tới
('LK-2026-008', 2, 1, 6, 1,
    CONCAT(DATE_ADD(CURDATE(), INTERVAL 7 DAY), ' 09:00:00'),
    CONCAT(DATE_ADD(CURDATE(), INTERVAL 7 DAY), ' 09:30:00'),
    'Kiểm tra định kỳ tiểu đường', 'ChoXacNhan', 'Tái khám tháng', 2),

('LK-2026-009', 4, 3, 4, 3,
    CONCAT(DATE_ADD(CURDATE(), INTERVAL 7 DAY), ' 13:30:00'),
    CONCAT(DATE_ADD(CURDATE(), INTERVAL 7 DAY), ' 14:00:00'),
    'Kiểm tra sau nhổ răng', 'ChoXacNhan', '', 2),

-- Lịch đã hủy (để test filter)
('LK-2026-010', 5, 2, 9, 2,
    CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 08:30:00'),
    CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 09:00:00'),
    'Đau bụng', 'DaHuy', 'Bệnh nhân tự hủy lịch', 2);

-- ============================================================
-- BƯỚC 9: HoSoKhamBenh (FK -> LichKham đã 'DaKham', BenhNhan, BacSi)
-- Chỉ tạo cho lịch có TrangThai = 'DaKham' (LK-2026-005, LichKhamId=5)
-- ============================================================
INSERT INTO HoSoKhamBenh (MaHoSo, LichKhamId, BenhNhanId, BacSiId, TrieuChung, ChanDoan, KeHoachDieuTri, KetLuan, GhiChu, NgayKham) VALUES
('HS-2026-001', 5, 5, 1,
    'Nổi mẩn đỏ, ngứa vùng da tay và chân, triệu chứng tăng vào buổi tối',
    'Viêm da dị ứng tiếp xúc (Contact Dermatitis)',
    'Tránh tiếp xúc với tác nhân gây dị ứng, dùng thuốc kháng histamine',
    'Bệnh nhân đáp ứng tốt với điều trị, theo dõi thêm 1 tuần',
    'Tái khám nếu triệu chứng không cải thiện',
    CONCAT(CURDATE(), ' 14:30:00'));

-- ============================================================
-- BƯỚC 10: DonThuoc + DonThuocChiTiet (FK -> HoSoKhamBenh)
-- ============================================================
INSERT INTO DonThuoc (MaDonThuoc, HoSoId, GhiChu) VALUES
('DT-2026-001', 1, 'Đơn thuốc viêm da dị ứng - uống đủ liều');

INSERT INTO DonThuocChiTiet (DonThuocId, TenThuoc, LieuLuong, SoLuong, DonVi, HuongDanSuDung, ThoiGianDung) VALUES
(1, 'Cetirizine 10mg',         '1 viên/lần', 14, 'Viên', 'Uống 1 lần/ngày vào buổi tối trước khi ngủ',    '14 ngày'),
(1, 'Hydrocortisone Cream 1%', 'Bôi lượng vừa đủ', 1, 'Týp', 'Bôi vùng da bị ảnh hưởng 2 lần/ngày sáng&tối', '14 ngày'),
(1, 'Vitamin C 500mg',         '1 viên/lần', 14, 'Viên', 'Uống 1 lần/ngày sau bữa sáng',                  '14 ngày');

-- ============================================================
-- KIỂM TRA KẾT QUẢ
-- ============================================================
SELECT 'NguoiDung'       AS Bang, COUNT(*) AS SoLuong FROM NguoiDung
UNION ALL SELECT 'TaiKhoan',        COUNT(*) FROM TaiKhoan
UNION ALL SELECT 'BacSi',           COUNT(*) FROM BacSi
UNION ALL SELECT 'ChuyenKhoa',      COUNT(*) FROM ChuyenKhoa
UNION ALL SELECT 'PhongKham',       COUNT(*) FROM PhongKham
UNION ALL SELECT 'BenhNhan',        COUNT(*) FROM BenhNhan
UNION ALL SELECT 'LichLamViecBacSi',COUNT(*) FROM LichLamViecBacSi
UNION ALL SELECT 'LichKham',        COUNT(*) FROM LichKham
UNION ALL SELECT 'HoSoKhamBenh',    COUNT(*) FROM HoSoKhamBenh
UNION ALL SELECT 'DonThuoc',        COUNT(*) FROM DonThuoc
UNION ALL SELECT 'DonThuocChiTiet', COUNT(*) FROM DonThuocChiTiet;
