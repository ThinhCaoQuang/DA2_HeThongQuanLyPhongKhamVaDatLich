const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ThongBao = sequelize.define('ThongBao', {
  ThongBaoId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  MaThongBao: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  BenhNhanId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  BacSiId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  LichKhamId: DataTypes.INTEGER,
  LoaiThongBao: {
    type: DataTypes.ENUM('NhacLichKham', 'XacNhanLichKham', 'HuyLichKham', 'YeuCauKham', 'VanBan'),
    allowNull: false
  },
  TieuDe: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  NoiDung: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  DaDoc: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ThoiGianGui: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  ThoiGianDoc: DataTypes.DATE,
  CreatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  UpdatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'ThongBao',
  timestamps: false
});

module.exports = ThongBao;
