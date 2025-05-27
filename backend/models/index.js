const fs       = require('fs');
const path     = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const cfg      = require('../config/database');          // your sequelize-init helper
const sequelize = cfg;                                   // ← already returns a Sequelize

const db = {};

// Load every *.js file except this one
fs.readdirSync(__dirname)
  .filter(f => f !== 'index.js' && f.endsWith('.js'))
  .forEach(f => {
    // Every model file exports  (sequelize, DataTypes) => Model
    const model = require(path.join(__dirname, f))(sequelize, DataTypes);
    db[model.name] = model;
  });

// Run association hooks once all models are present
Object.values(db).forEach(model => {
  if (typeof model.associate === 'function') {
    model.associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;