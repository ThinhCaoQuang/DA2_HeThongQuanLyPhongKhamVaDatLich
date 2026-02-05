const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BacSi = sequelize.define('BacSi', {
  BacSiId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  NguoiDungId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  SoChungChi: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  CapHocVan: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  NamKinhNghiem: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  TieuSu: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  TrangThai: {
    type: DataTypes.ENUM('HoatDong', 'KhongHoatDong', 'NghiPhep'),
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
  tableName: 'BacSi',
  timestamps: false
});

module.exports = BacSi;
