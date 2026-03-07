const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LichLamViecBacSi = sequelize.define('LichLamViecBacSi', {
  LichLamViecId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  BacSiId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  NgayLamViec: {
    type: DataTypes.DATE,
    allowNull: false
  },
  CaLam: {
    type: DataTypes.ENUM('Sang', 'Chieu', 'Toi'),
    allowNull: false
  },
  GioBatDau: DataTypes.TIME,
  GioKetThuc: DataTypes.TIME,
  SoBenhNhanToiDa: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  TrangThai: {
    type: DataTypes.ENUM('HoatDong', 'Huy'),
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
  tableName: 'LichLamViecBacSi',
  timestamps: false,
  createdAt: false,
  updatedAt: false
});

module.exports = LichLamViecBacSi;
