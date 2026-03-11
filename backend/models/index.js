const sequelize = require('../config/database');

// Import all models
const NguoiDung = require('./NguoiDung');
const TaiKhoan = require('./TaiKhoan');
const ChuyenKhoa = require('./ChuyenKhoa');
const BacSi = require('./BacSi');
const BacSiChuyenKhoa = require('./BacSiChuyenKhoa');
const BenhNhan = require('./BenhNhan');
const LichLamViecBacSi = require('./LichLamViecBacSi');
const LichKham = require('./LichKham');
const HoSoKhamBenh = require('./HoSoKhamBenh');
const LanKham = require('./LanKham');
const DonThuoc = require('./DonThuoc');
const DonThuocChiTiet = require('./DonThuocChiTiet');
const ThongBao = require('./ThongBao');
const NhatKyHoatDong = require('./NhatKyHoatDong');

// Define associations
// NguoiDung -> TaiKhoan (1:1)
NguoiDung.hasOne(TaiKhoan, {
  foreignKey: 'NguoiDungId',
  onDelete: 'CASCADE'
});
TaiKhoan.belongsTo(NguoiDung, {
  foreignKey: 'NguoiDungId'
});

// NguoiDung -> BacSi (1:1)
NguoiDung.hasOne(BacSi, {
  foreignKey: 'NguoiDungId',
  onDelete: 'CASCADE'
});
BacSi.belongsTo(NguoiDung, {
  foreignKey: 'NguoiDungId'
});

// BacSi <-> ChuyenKhoa (M:M through BacSiChuyenKhoa)
BacSi.belongsToMany(ChuyenKhoa, {
  through: BacSiChuyenKhoa,
  foreignKey: 'BacSiId',
  otherKey: 'ChuyenKhoaId',
  onDelete: 'CASCADE'
});
ChuyenKhoa.belongsToMany(BacSi, {
  through: BacSiChuyenKhoa,
  foreignKey: 'ChuyenKhoaId',
  otherKey: 'BacSiId'
});

// BacSiChuyenKhoa associations
BacSiChuyenKhoa.belongsTo(BacSi, { foreignKey: 'BacSiId' });
BacSiChuyenKhoa.belongsTo(ChuyenKhoa, { foreignKey: 'ChuyenKhoaId' });
BacSi.hasMany(BacSiChuyenKhoa, { foreignKey: 'BacSiId' });
ChuyenKhoa.hasMany(BacSiChuyenKhoa, { foreignKey: 'ChuyenKhoaId' });

// BacSi -> LichLamViecBacSi (1:M)
BacSi.hasMany(LichLamViecBacSi, {
  foreignKey: 'BacSiId',
  onDelete: 'CASCADE'
});
LichLamViecBacSi.belongsTo(BacSi, {
  foreignKey: 'BacSiId'
});

// BacSi -> LichKham (1:M)
BacSi.hasMany(LichKham, {
  foreignKey: 'BacSiId',
  onDelete: 'SET NULL'
});
LichKham.belongsTo(BacSi, {
  foreignKey: 'BacSiId'
});

// BenhNhan -> LichKham (1:M)
BenhNhan.hasMany(LichKham, {
  foreignKey: 'BenhNhanId',
  onDelete: 'CASCADE'
});
LichKham.belongsTo(BenhNhan, {
  foreignKey: 'BenhNhanId'
});

// ChuyenKhoa -> LichKham (1:M)
ChuyenKhoa.hasMany(LichKham, {
  foreignKey: 'ChuyenKhoaId',
  onDelete: 'SET NULL'
});
LichKham.belongsTo(ChuyenKhoa, {
  foreignKey: 'ChuyenKhoaId'
});

// LichKham -> HoSoKhamBenh: không còn (HoSo không link trực tiếp tới LichKham nữa)
// LichKham -> LanKham (1:1) — mỗi lịch khám có 1 lần khám
LichKham.hasOne(LanKham, {
  foreignKey: 'LichKhamId',
  onDelete: 'SET NULL'
});
LanKham.belongsTo(LichKham, {
  foreignKey: 'LichKhamId'
});

// BenhNhan -> HoSoKhamBenh (1:1) — mỗi bệnh nhân có 1 hồ sơ duy nhất
BenhNhan.hasOne(HoSoKhamBenh, {
  foreignKey: 'BenhNhanId',
  onDelete: 'CASCADE'
});
HoSoKhamBenh.belongsTo(BenhNhan, {
  foreignKey: 'BenhNhanId'
});

// HoSoKhamBenh -> LanKham (1:M) — nhiều lần khám trong 1 hồ sơ
HoSoKhamBenh.hasMany(LanKham, {
  foreignKey: 'HoSoId',
  onDelete: 'CASCADE'
});
LanKham.belongsTo(HoSoKhamBenh, {
  foreignKey: 'HoSoId'
});

// BacSi -> LanKham (1:M)
BacSi.hasMany(LanKham, {
  foreignKey: 'BacSiId',
  onDelete: 'SET NULL'
});
LanKham.belongsTo(BacSi, {
  foreignKey: 'BacSiId'
});

// LanKham -> DonThuoc (1:1) — mỗi lần khám có 1 đơn thuốc
LanKham.hasOne(DonThuoc, {
  foreignKey: 'LanKhamId',
  onDelete: 'CASCADE'
});
DonThuoc.belongsTo(LanKham, {
  foreignKey: 'LanKhamId'
});

// DonThuoc -> DonThuocChiTiet (1:M)
DonThuoc.hasMany(DonThuocChiTiet, {
  foreignKey: 'DonThuocId',
  onDelete: 'CASCADE'
});
DonThuocChiTiet.belongsTo(DonThuoc, {
  foreignKey: 'DonThuocId'
});

// LichKham -> ThongBao (1:M)
LichKham.hasMany(ThongBao, {
  foreignKey: 'LichKhamId',
  onDelete: 'SET NULL'
});
ThongBao.belongsTo(LichKham, {
  foreignKey: 'LichKhamId'
});

// BenhNhan -> ThongBao (1:M)
BenhNhan.hasMany(ThongBao, {
  foreignKey: 'BenhNhanId',
  onDelete: 'CASCADE'
});
ThongBao.belongsTo(BenhNhan, {
  foreignKey: 'BenhNhanId'
});

// BacSi -> ThongBao (1:M)
BacSi.hasMany(ThongBao, {
  foreignKey: 'BacSiId',
  onDelete: 'CASCADE'
});
ThongBao.belongsTo(BacSi, {
  foreignKey: 'BacSiId'
});

// TaiKhoan -> NhatKyHoatDong (1:M)
TaiKhoan.hasMany(NhatKyHoatDong, {
  foreignKey: 'TaiKhoanId',
  onDelete: 'CASCADE'
});
NhatKyHoatDong.belongsTo(TaiKhoan, {
  foreignKey: 'TaiKhoanId'
});

// Export all models
module.exports = {
  sequelize,
  NguoiDung,
  TaiKhoan,
  ChuyenKhoa,
  BacSi,
  BacSiChuyenKhoa,
  BenhNhan,
  LichLamViecBacSi,
  LichKham,
  HoSoKhamBenh,
  LanKham,
  DonThuoc,
  DonThuocChiTiet,
  ThongBao,
  NhatKyHoatDong
};
