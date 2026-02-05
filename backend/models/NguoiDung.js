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
  DienThoai: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  Email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  DiaChi: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ThanhPho: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  NgaySinh: {
    type: DataTypes.DATE,
    allowNull: true
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
  tableName: 'NguoiDung',
  timestamps: false
});

module.exports = NguoiDung;
