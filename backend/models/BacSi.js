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
    unique: true,
    allowNull: false
  },
  CapHocVan: DataTypes.STRING(100),
  NamKinhNghiem: DataTypes.INTEGER,
  TieuSu: DataTypes.TEXT,
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
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'BacSi',
  timestamps: false
});

module.exports = BacSi;
