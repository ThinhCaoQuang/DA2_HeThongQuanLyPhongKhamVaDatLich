const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BacSiChuyenKhoa = sequelize.define('BacSiChuyenKhoa', {
  BacSiChuyenKhoaId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  BacSiId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ChuyenKhoaId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  LaChuyenMonChinh: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  CreatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'BacSiChuyenKhoa',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['BacSiId', 'ChuyenKhoaId']
    }
  ]
});

module.exports = BacSiChuyenKhoa;
