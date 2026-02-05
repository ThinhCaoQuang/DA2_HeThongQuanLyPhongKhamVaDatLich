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
    allowNull: false,
    unique: true
  },
  HoTen: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  NgaySinh: {
    type: DataTypes.DATE,
    allowNull: true
  },
  GioiTinh: {
    type: DataTypes.ENUM('Nam', 'Nu', 'Khac'),
    allowNull: true
  },
  DienThoai: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  Email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  DiaChi: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ThanhPho: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  TienSuBenhLy: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  DiUng: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  GhiChu: {
    type: DataTypes.TEXT,
    allowNull: true
  },
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
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
}, {
  tableName: 'BenhNhan',
  timestamps: false
});

module.exports = BenhNhan;
