-- ─────────────────────────────────────────────────────────────────────
-- Migration: HoSoKhamBenh → HoSo (1/BenhNhan) + LanKham (N/HoSo)
-- ─────────────────────────────────────────────────────────────────────
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Tạo bảng LanKham
CREATE TABLE IF NOT EXISTS lankham (
  LanKhamId       INT AUTO_INCREMENT PRIMARY KEY,
  MaLanKham       VARCHAR(20) NOT NULL UNIQUE,
  HoSoId          INT NOT NULL,
  LichKhamId      INT UNIQUE,
  BacSiId         INT,
  TrieuChung      TEXT NOT NULL,
  ChanDoan        TEXT NOT NULL,
  KeHoachDieuTri  TEXT,
  KetLuan         TEXT,
  GhiChu          TEXT,
  NgayKham        DATETIME DEFAULT NOW(),
  CreatedAt       DATETIME DEFAULT NOW(),
  UpdatedAt       DATETIME DEFAULT NOW(),
  FOREIGN KEY (HoSoId)    REFERENCES hosokhambenh(HoSoId) ON DELETE CASCADE,
  FOREIGN KEY (LichKhamId) REFERENCES lichkham(LichKhamId) ON DELETE SET NULL,
  FOREIGN KEY (BacSiId)   REFERENCES bacsi(BacSiId) ON DELETE SET NULL
);

-- 2. Gộp các HoSo trùng BenhNhanId (giữ HoSoId nhỏ nhất)
--    Với BenhNhanId=9 có HoSoId 9 và 10 → giữ 9, chuyển DonThuoc của 10 sang 9
UPDATE donthuoc dt
JOIN hosokhambenh h ON dt.HoSoId = h.HoSoId
JOIN (
  SELECT BenhNhanId, MIN(HoSoId) AS FirstId
  FROM hosokhambenh
  GROUP BY BenhNhanId
) base ON h.BenhNhanId = base.BenhNhanId
SET dt.HoSoId = base.FirstId
WHERE dt.HoSoId != base.FirstId;

-- 3. Xóa HoSo thừa (không phải HoSoId nhỏ nhất cho mỗi BenhNhanId)
DELETE FROM hosokhambenh
WHERE HoSoId NOT IN (
  SELECT FirstId FROM (
    SELECT MIN(HoSoId) AS FirstId FROM hosokhambenh GROUP BY BenhNhanId
  ) tmp
);

-- 4. Migrate dữ liệu HoSoKhamBenh → LanKham
INSERT INTO lankham (MaLanKham, HoSoId, LichKhamId, BacSiId, TrieuChung, ChanDoan, KeHoachDieuTri, KetLuan, GhiChu, NgayKham, CreatedAt, UpdatedAt)
SELECT
  CONCAT('LK', LPAD(HoSoId, 4, '0')),
  HoSoId,
  LichKhamId,
  BacSiId,
  COALESCE(TrieuChung, 'Không có thông tin'),
  COALESCE(ChanDoan, 'Không có thông tin'),
  KeHoachDieuTri,
  KetLuan,
  GhiChu,
  COALESCE(NgayKham, NOW()),
  COALESCE(CreatedAt, NOW()),
  COALESCE(UpdatedAt, NOW())
FROM hosokhambenh;

-- 5. Thêm cột LanKhamId vào DonThuoc
ALTER TABLE donthuoc ADD COLUMN LanKhamId INT;
ALTER TABLE donthuoc ADD CONSTRAINT fk_dt_lankham
  FOREIGN KEY (LanKhamId) REFERENCES lankham(LanKhamId) ON DELETE SET NULL;

-- 6. Migrate DonThuoc: HoSoId → LanKhamId (mỗi HoSo hiện chỉ có 1 LanKham)
UPDATE donthuoc dt
JOIN lankham lk ON lk.HoSoId = dt.HoSoId
SET dt.LanKhamId = lk.LanKhamId;

-- 7. Xóa FK cũ của DonThuoc → HoSoKhamBenh
ALTER TABLE donthuoc DROP FOREIGN KEY donthuoc_ibfk_1;
-- (tên FK thực tế có thể khác, thử cả tên chuẩn)

-- 8. Thêm UNIQUE constraint BenhNhanId trong HoSoKhamBenh
ALTER TABLE hosokhambenh ADD UNIQUE INDEX idx_benhnhan_unique (BenhNhanId);

-- 9. Drop các cột cũ khỏi HoSoKhamBenh
ALTER TABLE hosokhambenh
  DROP COLUMN LichKhamId,
  DROP COLUMN BacSiId,
  DROP COLUMN TrieuChung,
  DROP COLUMN ChanDoan,
  DROP COLUMN KeHoachDieuTri,
  DROP COLUMN KetLuan,
  DROP COLUMN NgayKham;

-- 10. Drop cột HoSoId cũ khỏi DonThuoc
ALTER TABLE donthuoc DROP COLUMN HoSoId;

SET FOREIGN_KEY_CHECKS = 1;

-- Kiểm tra kết quả
SELECT 'LanKham rows:' AS info, COUNT(*) AS cnt FROM lankham
UNION ALL
SELECT 'HoSoKhamBenh rows:', COUNT(*) FROM hosokhambenh
UNION ALL
SELECT 'DonThuoc rows:', COUNT(*) FROM donthuoc;

DESCRIBE hosokhambenh;
DESCRIBE lankham;
DESCRIBE donthuoc;
