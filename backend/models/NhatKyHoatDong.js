const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NhatKyHoatDong = sequelize.define('NhatKyHoatDong', {
  NhatKyId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  TaiKhoanId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  HanhDong: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  LoaiEntity: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  EntityId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  GiaTriCu: {
    type: DataTypes.JSON,
    allowNull: true
  },
  GiaTriMoi: {
    type: DataTypes.JSON,
    allowNull: true
  },
  DiaChiIp: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  CreatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'NhatKyHoatDong',
  timestamps: false
});

module.exports = NhatKyHoatDong;
