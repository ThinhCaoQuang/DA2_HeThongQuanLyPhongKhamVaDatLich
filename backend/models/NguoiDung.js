const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NguoiDung = sequelize.define('NguoiDung', {
  NguoiDungId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  HoTen: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  GioiTinh: {
    type: DataTypes.ENUM('Nam', 'Nu', 'Khac'),
    defaultValue: 'Khac'
  },
  DienThoai: DataTypes.STRING(20),
  Email: DataTypes.STRING(100),
  DiaChi: DataTypes.TEXT,
  ThanhPho: DataTypes.STRING(50),
  NgaySinh: DataTypes.DATE,
  CreatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  UpdatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'NguoiDung',
  timestamps: false
});

module.exports = NguoiDung;
