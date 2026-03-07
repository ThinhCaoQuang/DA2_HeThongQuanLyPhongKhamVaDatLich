const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LichKham = sequelize.define('LichKham', {
  LichKhamId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  MaLichKham: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  BenhNhanId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  BacSiId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  ChuyenKhoaId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ThoiGianBatDau: {
    type: DataTypes.DATE,
    allowNull: false
  },
  ThoiGianKetThuc: {
    type: DataTypes.DATE,
    allowNull: true
  },
  TrieuChung: DataTypes.TEXT,
  TrangThai: {
    type: DataTypes.ENUM('ChoXacNhan', 'DaXacNhan', 'DaKham', 'DaHuy'),
    defaultValue: 'ChoXacNhan'
  },
  LyDoHuy: DataTypes.TEXT,
  GhiChu: DataTypes.TEXT,
  TaoBoi: DataTypes.INTEGER,
  XacNhanBoi: DataTypes.INTEGER,
  HuyBoi: DataTypes.INTEGER,
  CreatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  ThoiGianXacNhan: DataTypes.DATE,
  ThoiGianHuy: DataTypes.DATE,
  UpdatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'LichKham',
  timestamps: false
});

module.exports = LichKham;
