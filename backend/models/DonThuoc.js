const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DonThuoc = sequelize.define('DonThuoc', {
  DonThuocId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  MaDonThuoc: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  HoSoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  GhiChu: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  CreatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'DonThuoc',
  timestamps: false
});

module.exports = DonThuoc;
