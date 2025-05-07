const User = require('./user');
const Course = require('./course');
const Module = require('./module');
const Progress = require('./progress');
const sequelize = require('../config/database');

// User-Course relationship (many-to-many)
const Enrollment = sequelize.define('Enrollment', {
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'student'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

User.belongsToMany(Course, { through: Enrollment });
Course.belongsToMany(User, { through: Enrollment });

// Course-Module relationship (many-to-many)
const CourseModule = sequelize.define('CourseModule', {
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  isRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

Course.belongsToMany(Module, { through: CourseModule });
Module.belongsToMany(Course, { through: CourseModule });

// Progress relationships
Progress.belongsTo(User);
Progress.belongsTo(Module);
Progress.belongsTo(Course);

User.hasMany(Progress);
Module.hasMany(Progress);
Course.hasMany(Progress);

module.exports = {
  User,
  Course,
  Module,
  Progress,
  Enrollment,
  CourseModule,
  sequelize
}; 