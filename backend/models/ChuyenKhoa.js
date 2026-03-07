const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChuyenKhoa = sequelize.define('ChuyenKhoa', {
  ChuyenKhoaId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  TenChuyenKhoa: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  MoTa: DataTypes.TEXT,
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
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'ChuyenKhoa',
  timestamps: false
});

module.exports = ChuyenKhoa;
