const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NhatKyHoatDong = sequelize.define('NhatKyHoatDong', {
  NhatKyId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  MaNhatKy: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  TaiKhoanId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  LoaiHoatDong: {
    type: DataTypes.ENUM('DangNhap', 'DangXuat', 'TaoBenhNhan', 'SuaBenhNhan', 'XoaBenhNhan', 'TaoLichKham', 'SuaLichKham', 'HuyLichKham', 'XacNhanLichKham', 'TaoHoSoKhamBenh', 'ChotDonThuoc', 'KhoaLichKham'),
    allowNull: false
  },
  DiaChiIP: DataTypes.STRING(50),
  ChiTietHoatDong: DataTypes.TEXT,
  ThoiGian: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  CreatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'NhatKyHoatDong',
  timestamps: false
});

module.exports = NhatKyHoatDong;
