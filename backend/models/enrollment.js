module.exports = (sequelize, DataTypes) => {
    const Enrollment = sequelize.define('Enrollment', {
        id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        role:       { type: DataTypes.STRING, allowNull: false, defaultValue: 'student' },
        isActive:   { type: DataTypes.BOOLEAN, defaultValue: true },
        status:     { type: DataTypes.ENUM('active','completed','withdrawn'), defaultValue: 'active' },
        lastActivity:{ type: DataTypes.DATE },
        ltiUserId:  { type: DataTypes.STRING },
        completedAt:{ type: DataTypes.DATE }
      }, {
        tableName: 'enrollments',
        indexes: [
          { unique: true, fields: ['UserId', 'SessionId'] }   // one per student+session
        ]
      }
    );
  
    Enrollment.associate = models => {
      Enrollment.belongsTo(models.User,    { foreignKey: { allowNull: false } });
      Enrollment.belongsTo(models.Session, { foreignKey: { allowNull: false } });
      Enrollment.hasMany(models.Progress, {
        foreignKey: 'EnrollmentId',
        as:         'Progresses'
      });
    };
  
    return Enrollment;
  };