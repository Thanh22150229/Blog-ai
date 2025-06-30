const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // Import sequelize từ file cấu hình

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID, // Đã sửa từ STRING thành UUID
    allowNull: false,
  },
  plan: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'Payments',
  timestamps: true,
});

module.exports = Payment;