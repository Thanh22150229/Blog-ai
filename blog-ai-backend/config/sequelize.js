const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.DATABASE_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: false, // Tắt log SQL nếu không cần
});

module.exports = sequelize;
