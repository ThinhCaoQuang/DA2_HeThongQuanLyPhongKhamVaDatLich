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
  GioBatDau: {
    type: DataTypes.TIME,
    allowNull: false
  },
  GioKetThuc: {
    type: DataTypes.TIME,
    allowNull: false
  },
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
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
}, {
  tableName: 'LichLamViecBacSi',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['BacSiId', 'NgayLamViec', 'CaLam']
    }
  ]
});

module.exports = LichLamViecBacSi;
