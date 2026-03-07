const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BenhNhan = sequelize.define('BenhNhan', {
  BenhNhanId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  MaBenhNhan: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  HoTen: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  NgaySinh: DataTypes.DATE,
  GioiTinh: {
    type: DataTypes.ENUM('Nam', 'Nu', 'Khac')
  },
  CCCD: DataTypes.STRING(12),
  DienThoai: DataTypes.STRING(20),
  Email: DataTypes.STRING(100),
  DiaChi: DataTypes.TEXT,
  ThanhPho: DataTypes.STRING(50),
  TienSuBenhLy: DataTypes.TEXT,
  DiUng: DataTypes.TEXT,
  GhiChu: DataTypes.TEXT,
  TrangThai: {
    type: DataTypes.ENUM('HoatDong', 'KhongHoatDong'),
    defaultValue: 'HoatDong'
  },
  CreatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  UpdatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'BenhNhan',
  timestamps: false
});

module.exports = BenhNhan;
