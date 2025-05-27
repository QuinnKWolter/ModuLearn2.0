const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '../.env' }); // Ensure .env is loaded

let sequelize;

if (process.env.NODE_ENV === 'production') {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false, // Optional: disable logging in production
  });
} else {
  sequelize = new Sequelize({
    database: process.env.DB_NAME || 'modulearn',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log, // Optional: log SQL queries in development
  });
}

module.exports = sequelize;