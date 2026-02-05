const sequelize = require('../config/database');
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
const ThongBao = require('./ThongBao');
const NhatKyHoatDong = require('./NhatKyHoatDong');

// Define associations
NguoiDung.hasOne(TaiKhoan, { foreignKey: 'NguoiDungId', onDelete: 'CASCADE' });
TaiKhoan.belongsTo(NguoiDung, { foreignKey: 'NguoiDungId' });

NguoiDung.hasOne(BacSi, { foreignKey: 'NguoiDungId', onDelete: 'CASCADE' });
BacSi.belongsTo(NguoiDung, { foreignKey: 'NguoiDungId' });

BacSi.hasMany(BacSiChuyenKhoa, { foreignKey: 'BacSiId', onDelete: 'CASCADE' });
BacSiChuyenKhoa.belongsTo(BacSi, { foreignKey: 'BacSiId' });

ChuyenKhoa.hasMany(BacSiChuyenKhoa, { foreignKey: 'ChuyenKhoaId', onDelete: 'CASCADE' });
BacSiChuyenKhoa.belongsTo(ChuyenKhoa, { foreignKey: 'ChuyenKhoaId' });

BacSi.hasMany(LichLamViecBacSi, { foreignKey: 'BacSiId', onDelete: 'CASCADE' });
LichLamViecBacSi.belongsTo(BacSi, { foreignKey: 'BacSiId' });

BenhNhan.hasMany(LichKham, { foreignKey: 'BenhNhanId', onDelete: 'CASCADE' });
LichKham.belongsTo(BenhNhan, { foreignKey: 'BenhNhanId' });

BacSi.hasMany(LichKham, { foreignKey: 'BacSiId' });
LichKham.belongsTo(BacSi, { foreignKey: 'BacSiId' });

ChuyenKhoa.hasMany(LichKham, { foreignKey: 'ChuyenKhoaId' });
LichKham.belongsTo(ChuyenKhoa, { foreignKey: 'ChuyenKhoaId' });

TaiKhoan.hasMany(LichKham, { foreignKey: 'TaoBoi', as: 'LichKhamTao' });
LichKham.belongsTo(TaiKhoan, { foreignKey: 'TaoBoi', as: 'NguoiTao' });

TaiKhoan.hasMany(LichKham, { foreignKey: 'XacNhanBoi', as: 'LichKhamXacNhan' });
LichKham.belongsTo(TaiKhoan, { foreignKey: 'XacNhanBoi', as: 'NguoiXacNhan' });

TaiKhoan.hasMany(LichKham, { foreignKey: 'HuyBoi', as: 'LichKhamHuy' });
LichKham.belongsTo(TaiKhoan, { foreignKey: 'HuyBoi', as: 'NguoiHuy' });

LichKham.hasOne(HoSoKhamBenh, { foreignKey: 'LichKhamId', onDelete: 'CASCADE' });
HoSoKhamBenh.belongsTo(LichKham, { foreignKey: 'LichKhamId' });

BenhNhan.hasMany(HoSoKhamBenh, { foreignKey: 'BenhNhanId', onDelete: 'CASCADE' });
HoSoKhamBenh.belongsTo(BenhNhan, { foreignKey: 'BenhNhanId' });

BacSi.hasMany(HoSoKhamBenh, { foreignKey: 'BacSiId' });
HoSoKhamBenh.belongsTo(BacSi, { foreignKey: 'BacSiId' });

HoSoKhamBenh.hasMany(DonThuoc, { foreignKey: 'HoSoId', onDelete: 'CASCADE' });
DonThuoc.belongsTo(HoSoKhamBenh, { foreignKey: 'HoSoId' });

TaiKhoan.hasMany(ThongBao, { foreignKey: 'TaiKhoanId', onDelete: 'CASCADE' });
ThongBao.belongsTo(TaiKhoan, { foreignKey: 'TaiKhoanId' });

LichKham.hasMany(ThongBao, { foreignKey: 'LichKhamId', onDelete: 'SET NULL' });
ThongBao.belongsTo(LichKham, { foreignKey: 'LichKhamId' });

TaiKhoan.hasMany(NhatKyHoatDong, { foreignKey: 'TaiKhoanId', onDelete: 'SET NULL' });
NhatKyHoatDong.belongsTo(TaiKhoan, { foreignKey: 'TaiKhoanId' });

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
  ThongBao,
  NhatKyHoatDong
};
