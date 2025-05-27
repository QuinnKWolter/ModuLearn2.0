module.exports = (sequelize, DataTypes) => {
    const Session = sequelize.define('Session', {
      id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      groupName: { type: DataTypes.STRING, allowNull: false },
      isActive:  { type: DataTypes.BOOLEAN, defaultValue: true },
      metadata:  { type: DataTypes.JSON }
    });
  
    Session.associate = models => {
      Session.belongsTo    (models.Course);
      Session.hasMany      (models.Enrollment);
      Session.hasMany      (models.Progress);
      Session.belongsToMany(models.User, { as: 'students',    through: { model: models.Enrollment, scope: { role: 'student' }},    foreignKey: 'SessionId', otherKey: 'UserId'});
      Session.belongsToMany(models.User, { as: 'instructors', through: { model: models.Enrollment, scope: { role: 'instructor' }}, foreignKey: 'SessionId', otherKey: 'UserId'});
      Session.belongsToMany(models.User, { as: 'researchers', through: { model: models.Enrollment, scope: { role: 'researcher' }}, foreignKey: 'SessionId', otherKey: 'UserId'});
    };
  
    return Session;
  };
  