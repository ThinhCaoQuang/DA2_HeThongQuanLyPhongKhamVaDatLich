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

// LichKham -> HoSoKhamBenh (1:1)
LichKham.hasOne(HoSoKhamBenh, {
  foreignKey: 'LichKhamId',
  onDelete: 'CASCADE'
});
HoSoKhamBenh.belongsTo(LichKham, {
  foreignKey: 'LichKhamId'
});

// BenhNhan -> HoSoKhamBenh (1:M)
BenhNhan.hasMany(HoSoKhamBenh, {
  foreignKey: 'BenhNhanId',
  onDelete: 'CASCADE'
});
HoSoKhamBenh.belongsTo(BenhNhan, {
  foreignKey: 'BenhNhanId'
});

// BacSi -> HoSoKhamBenh (1:M)
BacSi.hasMany(HoSoKhamBenh, {
  foreignKey: 'BacSiId',
  onDelete: 'SET NULL'
});
HoSoKhamBenh.belongsTo(BacSi, {
  foreignKey: 'BacSiId'
});

// HoSoKhamBenh -> DonThuoc (1:1)
HoSoKhamBenh.hasOne(DonThuoc, {
  foreignKey: 'HoSoId',
  onDelete: 'CASCADE'
});
DonThuoc.belongsTo(HoSoKhamBenh, {
  foreignKey: 'HoSoId'
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
  DonThuoc,
  DonThuocChiTiet,
  ThongBao,
  NhatKyHoatDong
};
