const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HoSoKhamBenh = sequelize.define('HoSoKhamBenh', {
  HoSoId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  MaHoSo: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  LichKhamId: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: false
  },
  BenhNhanId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  BacSiId: {
    type: DataTypes.INTEGER,
    allowNull: false
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
  tableName: 'HoSoKhamBenh',
  timestamps: false
});

module.exports = HoSoKhamBenh;
