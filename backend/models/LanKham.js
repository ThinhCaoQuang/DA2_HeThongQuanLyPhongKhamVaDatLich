const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LanKham = sequelize.define('LanKham', {
  LanKhamId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  MaLanKham: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  HoSoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  LichKhamId: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: true
  },
  BacSiId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  TrieuChung: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  ChanDoan: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  KeHoachDieuTri: DataTypes.TEXT,
  KetLuan: DataTypes.TEXT,
  GhiChu: DataTypes.TEXT,
  NgayKham: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
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
  tableName: 'LanKham',
  timestamps: false
});

module.exports = LanKham;
