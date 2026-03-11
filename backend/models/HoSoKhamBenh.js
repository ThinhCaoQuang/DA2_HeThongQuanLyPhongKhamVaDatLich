const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HoSoKhamBenh = sequelize.define('HoSoKhamBenh', {
  HoSoId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  MaHoSo: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  BenhNhanId: {
    type: DataTypes.INTEGER,
    unique: true,   // 1 hồ sơ per bệnh nhân
    allowNull: false
  },
  GhiChu: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'HoSoKhamBenh',
  timestamps: false
});

module.exports = HoSoKhamBenh;

