const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TaiKhoan = sequelize.define('TaiKhoan', {
  TaiKhoanId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  NguoiDungId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  TenDangNhap: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  MatKhauHash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  VaiTro: {
    type: DataTypes.ENUM('QuanTri', 'LeTan', 'BacSi'),
    allowNull: false
  },
  TrangThai: {
    type: DataTypes.ENUM('HoatDong', 'KhongHoatDong'),
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
  tableName: 'TaiKhoan',
  timestamps: false
});

module.exports = TaiKhoan;
