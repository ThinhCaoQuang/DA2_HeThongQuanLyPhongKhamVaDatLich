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
    allowNull: false,
    unique: true
  },
  MoTa: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'ChuyenKhoa',
  timestamps: false
});

module.exports = ChuyenKhoa;
