const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DonThuoc = sequelize.define('DonThuoc', {
  DonThuocId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  MaDonThuoc: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  HoSoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  TenThuoc: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  LieuLuong: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  SoLuong: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  DonVi: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  HuongDanSuDung: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ThoiGianDung: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  CreatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'DonThuoc',
  timestamps: false
});

module.exports = DonThuoc;
