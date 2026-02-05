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
    allowNull: false,
    unique: true
  },
  BenhNhanId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  BacSiId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ChuyenKhoaId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  NgayKham: {
    type: DataTypes.DATE,
    allowNull: false
  },
  CaKham: {
    type: DataTypes.ENUM('Sang', 'Chieu', 'Toi'),
    allowNull: false
  },
  GioKham: {
    type: DataTypes.TIME,
    allowNull: true
  },
  TrieuChung: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  TrangThai: {
    type: DataTypes.ENUM('ChoXacNhan', 'DaXacNhan', 'DaKham', 'DaHuy'),
    defaultValue: 'ChoXacNhan'
  },
  LyDoHuy: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  GhiChu: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  TaoBoi: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  XacNhanBoi: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  HuyBoi: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  CreatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  ThoiGianXacNhan: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ThoiGianHuy: {
    type: DataTypes.DATE,
    allowNull: true
  },
  UpdatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
}, {
  tableName: 'LichKham',
  timestamps: false
});

module.exports = LichKham;
