const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ThongBao = sequelize.define('ThongBao', {
  ThongBaoId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  TaiKhoanId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  LichKhamId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  LoaiThongBao: {
    type: DataTypes.ENUM('NhacLich', 'LichDaXacNhan', 'LichDaHuy', 'LichDaKham', 'CanhBao'),
    defaultValue: 'CanhBao'
  },
  TieuDe: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  NoiDung: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  DaDoc: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  CreatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  DocLuc: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'ThongBao',
  timestamps: false
});

module.exports = ThongBao;
