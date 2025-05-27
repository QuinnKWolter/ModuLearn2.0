/* models/user.js */
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id:       { type: DataTypes.UUID,   defaultValue: DataTypes.UUIDV4, primaryKey: true },

      /* ── identity ─────────────────────────────────────────────────── */
      email:    { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
      fullName: { type: DataTypes.STRING },

      /* ── auth ─────────────────────────────────────────────────────── */
      password:     { type: DataTypes.STRING, allowNull: true },           // ← allow null for invited users
      roles:        { type: DataTypes.JSONB,  defaultValue: { student: true, instructor: false, researcher: false } },
      status:       { type: DataTypes.ENUM('active', 'invited', 'disabled'), defaultValue: 'active' },
      mustResetPw:  { type: DataTypes.BOOLEAN, defaultValue: false },
      inviteToken:  { type: DataTypes.UUID },
      emailVerified:{ type: DataTypes.BOOLEAN, defaultValue: false },

      /* ── platform extras ──────────────────────────────────────────── */
      ltiUserId:    { type: DataTypes.STRING },
      lti_data:     { type: DataTypes.JSONB },
      course_authoring_password: { type: DataTypes.STRING },
      refreshToken: { type: DataTypes.STRING(1024) },
      lastLogin:    { type: DataTypes.DATE },
      avatar:       { type: DataTypes.STRING },
      isActive:     { type: DataTypes.BOOLEAN, defaultValue: true }
    },
    {
      tableName:  'Users',
      hooks: {
        beforeCreate: hashPassword,
        beforeUpdate: hashPasswordIfChanged
      }
    }
  );

  /* ---------- instance helpers ---------- */
  User.prototype.comparePassword = async function (pw) {
    const bcrypt = require('bcrypt');
    if (!this.password) return false;
    return bcrypt.compare(pw, this.password);
  };

  /* ---------- associations -------------- */
  User.associate = (models) => {
    User.belongsToMany(models.Session, { through: models.Enrollment, as: 'sessions' });
    User.hasMany(models.Enrollment);
    User.hasMany(models.Progress);

    /* courses the instructor created */
    User.belongsToMany(models.Course, {
      through: 'CourseInstructors',
      as: 'createdCourses'
    });
  };

  /* ---------- private hooks ------------- */
  async function hashPassword(user) {
    const bcrypt = require('bcrypt');

    // skip hashing if no password (invited account)
    if (!user.password) return;

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }

  async function hashPasswordIfChanged(user) {
    if (user.changed('password')) {
      await hashPassword(user);
    }
  }

  return User;
};