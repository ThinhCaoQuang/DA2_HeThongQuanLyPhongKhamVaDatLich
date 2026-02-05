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
    allowNull: false,
    unique: true
  },
  LichKhamId: {
    type: DataTypes.INTEGER,
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
  TrieuChung: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  ChanDoan: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  KeHoachDieuTri: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  KetLuan: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  GhiChu: {
    type: DataTypes.TEXT,
    allowNull: true
  },
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
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
}, {
  tableName: 'HoSoKhamBenh',
  timestamps: false
});

module.exports = HoSoKhamBenh;
